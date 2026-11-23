// Places parts and routes copper traces on a Tinkercad Eagle .brd export.
// Two-layer grid maze router (Dijkstra) with pad/via clearance.
// The netlist (which pads connect) is kept exactly as exported.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Xml;

public static class BoardRouter
{
    const double P = 0.635;      // grid pitch (mm)
    const double TW = 0.4;       // trace width (mm)
    const double CLR = 0.2;      // copper clearance (mm)
    const double VIA_D = 0.8, VIA_DRILL = 0.4;
    const double EDGE = 0.8;     // keep copper this far from the board edge

    class Pad { public string El, Name; public double X, Y, R; public int Net; }
    class Seg { public double X1, Y1, X2, Y2; public int Layer; }

    static readonly CultureInfo IC = CultureInfo.InvariantCulture;
    static string F(double v) { return v.ToString("0.####", IC); }
    static double D(XmlElement e, string a)
    {
        string s = e.GetAttribute(a);
        return string.IsNullOrEmpty(s) ? 0 : double.Parse(s, IC);
    }

    static int NX, NY, N;
    static List<Pad> pads;
    static int netCount;

    public static string Run(string inPath, string outPath, string spec, double W, double H, int attempts)
    {
        var log = new StringBuilder();
        var doc = new XmlDocument();
        doc.XmlResolver = null;   // don't try to fetch eagle.dtd
        doc.Load(inPath);

        // 1. Board outline
        var plain = (XmlElement)doc.SelectSingleNode("//board/plain");
        foreach (XmlNode n in plain.SelectNodes("wire[@layer='20']")) plain.RemoveChild(n);
        double[,] c4 = { { 0, 0 }, { W, 0 }, { W, H }, { 0, H } };
        for (int i = 0; i < 4; i++)
        {
            int j = (i + 1) % 4;
            var w = doc.CreateElement("wire");
            w.SetAttribute("x1", F(c4[i, 0])); w.SetAttribute("y1", F(c4[i, 1]));
            w.SetAttribute("x2", F(c4[j, 0])); w.SetAttribute("y2", F(c4[j, 1]));
            w.SetAttribute("width", "0"); w.SetAttribute("layer", "20");
            plain.AppendChild(w);
        }

        // 2. Placement
        var place = new Dictionary<string, double[]>();
        foreach (var item in spec.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = item.Split(':');
            var v = kv[1].Split(',');
            place[kv[0].Trim()] = new[] { double.Parse(v[0], IC), double.Parse(v[1], IC), double.Parse(v[2], IC) };
        }
        var pkgs = new Dictionary<string, XmlElement>();
        foreach (XmlElement p in doc.SelectNodes("//packages/package")) pkgs[p.GetAttribute("name")] = p;

        pads = new List<Pad>();
        var padByKey = new Dictionary<string, Pad>();
        foreach (XmlElement e in doc.SelectNodes("//elements/element"))
        {
            string name = e.GetAttribute("name");
            if (!place.ContainsKey(name)) throw new Exception("No placement for " + name);
            var pl = place[name];
            e.SetAttribute("x", F(pl[0])); e.SetAttribute("y", F(pl[1])); e.SetAttribute("rot", "R" + F(pl[2]));
            foreach (XmlElement at in e.SelectNodes("attribute")) { at.SetAttribute("x", F(pl[0])); at.SetAttribute("y", F(pl[1])); }
            double r = pl[2] * Math.PI / 180, c = Math.Round(Math.Cos(r), 9), s = Math.Round(Math.Sin(r), 9);
            foreach (XmlElement pd in pkgs[e.GetAttribute("package")].SelectNodes("pad"))
            {
                double px = D(pd, "x"), py = D(pd, "y");
                var p = new Pad { El = name, Name = pd.GetAttribute("name"), X = pl[0] + px * c - py * s, Y = pl[1] + px * s + py * c, R = D(pd, "diameter") / 2 };
                pads.Add(p); padByKey[name + "|" + p.Name] = p;
            }
        }

        // 3. Nets (keep the exported netlist, drop the old airwires)
        var signals = new List<XmlElement>();
        foreach (XmlElement sg in doc.SelectNodes("//signals/signal"))
        {
            signals.Add(sg);
            var old = new List<XmlNode>();
            foreach (XmlNode n in sg.SelectNodes("wire|via")) old.Add(n);
            foreach (var n in old) sg.RemoveChild(n);
            foreach (XmlElement cr in sg.SelectNodes("contactref"))
                padByKey[cr.GetAttribute("element") + "|" + cr.GetAttribute("pad")].Net = signals.Count;
        }
        netCount = signals.Count;

        // 4. Grid and base keep-out
        NX = (int)Math.Floor(W / P) + 1; NY = (int)Math.Floor(H / P) + 1; N = NX * NY;
        var baseKeep = new int[N];
        var term = new int[N];       // pad index + 1 for cells inside pad copper
        for (int iy = 0; iy < NY; iy++)
            for (int ix = 0; ix < NX; ix++)
            {
                double x = ix * P, y = iy * P;
                if (x < EDGE || y < EDGE || x > W - EDGE || y > H - EDGE) baseKeep[iy * NX + ix] = -1;
            }
        for (int pi = 0; pi < pads.Count; pi++)
        {
            var p = pads[pi];
            int id = p.Net > 0 ? p.Net : -1;
            double rk = p.R + TW / 2 + CLR + 0.03;   // small margin for pad-shape rounding
            ForCells(p.X, p.Y, rk, cell =>
            {
                double dx = (cell % NX) * P - p.X, dy = (cell / NX) * P - p.Y;
                double d = Math.Sqrt(dx * dx + dy * dy);
                if (baseKeep[cell] == 0) baseKeep[cell] = id;
                else if (baseKeep[cell] != id) baseKeep[cell] = -1;
                if (d <= p.R - 0.05 && p.Net > 0) term[cell] = pi + 1;
            });
        }
        // terminal cells always belong to their own net
        for (int cI = 0; cI < N; cI++) if (term[cI] > 0) baseKeep[cI] = pads[term[cI] - 1].Net;

        // 5. Route, trying several net orders
        var netPads = new List<int>[netCount + 1];
        for (int n = 0; n <= netCount; n++) netPads[n] = new List<int>();
        for (int pi = 0; pi < pads.Count; pi++) if (pads[pi].Net > 0) netPads[pads[pi].Net].Add(pi);

        var order = new List<int>();
        for (int n = 1; n <= netCount; n++) if (netPads[n].Count > 1) order.Add(n);
        order.Sort((a, b) =>
        {
            int ca = netPads[a].Count, cb = netPads[b].Count;
            if ((ca >= 5) != (cb >= 5)) return ca >= 5 ? 1 : -1;      // power nets last
            return Span(netPads[a]).CompareTo(Span(netPads[b]));      // short nets first
        });

        List<Seg>[] bestSegs = null; List<double[]>[] bestVias = null; List<int[]>[] bestMissing = null;
        int bestFail = int.MaxValue, bestAttempt = -1;
        var rnd = new Random(7);
        for (int at = 0; at < attempts; at++)
        {
            var ord = new List<int>(order);
            if (at > 0)
            {
                // move a random failed-prone net to the front, then light shuffle
                for (int k = ord.Count - 1; k > 0; k--) { if (rnd.NextDouble() < 0.5) { int j = rnd.Next(k + 1); int t = ord[k]; ord[k] = ord[j]; ord[j] = t; } }
            }
            var keep = (int[])baseKeep.Clone();
            var occ = new int[2 * N];
            var segs = new List<Seg>[netCount + 1]; var vias = new List<double[]>[netCount + 1]; var missing = new List<int[]>[netCount + 1];
            int fails = 0;
            foreach (int n in ord)
            {
                segs[n] = new List<Seg>(); vias[n] = new List<double[]>(); missing[n] = new List<int[]>();
                fails += RouteNet(n, netPads[n], keep, occ, term, segs[n], vias[n], missing[n]);
            }
            if (fails < bestFail) { bestFail = fails; bestSegs = segs; bestVias = vias; bestMissing = missing; bestAttempt = at; }
            if (fails == 0) break;
        }

        // 6. Write copper into the signals
        int nSeg = 0, nVia = 0;
        for (int n = 1; n <= netCount; n++)
        {
            var sg = signals[n - 1];
            if (bestSegs == null || bestSegs[n] == null) continue;
            foreach (var s in bestSegs[n])
            {
                var w = doc.CreateElement("wire");
                w.SetAttribute("x1", F(s.X1)); w.SetAttribute("y1", F(s.Y1)); w.SetAttribute("x2", F(s.X2)); w.SetAttribute("y2", F(s.Y2));
                w.SetAttribute("width", F(TW)); w.SetAttribute("layer", s.Layer == 0 ? "1" : "16");
                sg.AppendChild(w); nSeg++;
            }
            foreach (var v in bestVias[n])
            {
                var via = doc.CreateElement("via");
                via.SetAttribute("x", F(v[0])); via.SetAttribute("y", F(v[1])); via.SetAttribute("extent", "1-16");
                via.SetAttribute("drill", F(VIA_DRILL)); via.SetAttribute("diameter", F(VIA_D));
                sg.AppendChild(via); nVia++;
            }
            foreach (var m in bestMissing[n])
            {
                var a = pads[m[0]]; var b = pads[m[1]];
                var w = doc.CreateElement("wire");
                w.SetAttribute("x1", F(a.X)); w.SetAttribute("y1", F(a.Y)); w.SetAttribute("x2", F(b.X)); w.SetAttribute("y2", F(b.Y));
                w.SetAttribute("width", "0"); w.SetAttribute("layer", "19"); w.SetAttribute("extent", "1-1");
                sg.AppendChild(w);
            }
        }
        var settings = new XmlWriterSettings { Indent = false, Encoding = new UTF8Encoding(false) };
        using (var xw = XmlWriter.Create(outPath, settings)) doc.Save(xw);
        log.AppendFormat("{0}: {1} nets, {2} segments, {3} vias, unrouted connections: {4} (attempt {5})",
            System.IO.Path.GetFileName(outPath), order.Count, nSeg, nVia, bestFail, bestAttempt);
        return log.ToString();
    }

    static double Span(List<int> pis)
    {
        double x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        foreach (int i in pis) { x0 = Math.Min(x0, pads[i].X); x1 = Math.Max(x1, pads[i].X); y0 = Math.Min(y0, pads[i].Y); y1 = Math.Max(y1, pads[i].Y); }
        return (x1 - x0) + (y1 - y0);
    }

    static void ForCells(double x, double y, double r, Action<int> f)
    {
        int ix0 = Math.Max(0, (int)Math.Floor((x - r) / P)), ix1 = Math.Min(NX - 1, (int)Math.Ceiling((x + r) / P));
        int iy0 = Math.Max(0, (int)Math.Floor((y - r) / P)), iy1 = Math.Min(NY - 1, (int)Math.Ceiling((y + r) / P));
        for (int iy = iy0; iy <= iy1; iy++)
            for (int ix = ix0; ix <= ix1; ix++)
            {
                double dx = ix * P - x, dy = iy * P - y;
                if (dx * dx + dy * dy <= r * r) f(iy * NX + ix);
            }
    }

    static bool Ok(int v, int n) { return v == 0 || v == n; }

    // Returns the number of pad connections that could not be routed.
    static int RouteNet(int n, List<int> pis, int[] keep, int[] occ, int[] term, List<Seg> segs, List<double[]> vias, List<int[]> missing)
    {
        var inTree = new bool[2 * N];
        var treePads = new List<int>();
        var remaining = new List<int>(pis);
        int first = remaining[0]; remaining.RemoveAt(0);
        AddPadToTree(first, inTree, term); treePads.Add(first);
        int fails = 0;

        while (remaining.Count > 0)
        {
            var dist = new int[2 * N]; var prev = new int[2 * N];
            for (int i = 0; i < 2 * N; i++) { dist[i] = int.MaxValue; prev[i] = -1; }
            var pq = new SortedSet<long>();
            for (int i = 0; i < 2 * N; i++) if (inTree[i]) { dist[i] = 0; pq.Add(i); }
            int hit = -1;
            while (pq.Count > 0)
            {
                long top = pq.Min; pq.Remove(top);
                int u = (int)(top & 0xFFFFFFFF), du = (int)(top >> 32);
                if (du > dist[u]) continue;
                int cell = u % N, layer = u / N;
                int tp = term[cell];
                if (tp > 0 && remaining.Contains(tp - 1) && !inTree[u]) { hit = u; break; }
                int cx = cell % NX, cy = cell / NX;
                // planar moves
                for (int k = 0; k < 4; k++)
                {
                    int nx = cx + (k == 0 ? 1 : k == 1 ? -1 : 0), ny = cy + (k == 2 ? 1 : k == 3 ? -1 : 0);
                    if (nx < 0 || ny < 0 || nx >= NX || ny >= NY) continue;
                    int nc = ny * NX + nx, v = layer * N + nc;
                    if (!Ok(keep[nc], n) || !Ok(occ[v], n)) continue;
                    bool horiz = k < 2;
                    int cost = 2 + ((layer == 0) == horiz ? 0 : 1);
                    Relax(u, v, du + cost, dist, prev, pq);
                }
                // layer change: free inside own pad, otherwise a via
                int o = (1 - layer) * N + cell;
                if (Ok(occ[o], n))
                {
                    if (term[cell] > 0 && pads[term[cell] - 1].Net == n) Relax(u, o, du, dist, prev, pq);
                    else if (ViaOk(cell, n, keep, occ)) Relax(u, o, du + 14, dist, prev, pq);
                }
            }
            if (hit < 0)
            {
                // could not reach any remaining pad: record as airwire and stop
                foreach (int r in remaining) { missing.Add(new[] { treePads[0], r }); fails++; }
                break;
            }
            int padIdx = term[hit % N] - 1;
            // backtrack
            var path = new List<int>();
            for (int v = hit; v >= 0; v = prev[v]) { path.Add(v); if (inTree[v]) break; }
            path.Reverse();
            Commit(n, path, keep, occ, term, inTree, segs, vias);
            remaining.Remove(padIdx); AddPadToTree(padIdx, inTree, term); treePads.Add(padIdx);
        }
        return fails;
    }

    static void Relax(int u, int v, int d, int[] dist, int[] prev, SortedSet<long> pq)
    {
        if (d < dist[v]) { dist[v] = d; prev[v] = u; pq.Add(((long)d << 32) | (uint)v); }
    }

    static bool ViaOk(int cell, int n, int[] keep, int[] occ)
    {
        if (!Ok(keep[cell], n)) return false;
        int cx = cell % NX, cy = cell / NX;
        for (int k = 0; k < 4; k++)
        {
            int nx = cx + (k == 0 ? 1 : k == 1 ? -1 : 0), ny = cy + (k == 2 ? 1 : k == 3 ? -1 : 0);
            if (nx < 0 || ny < 0 || nx >= NX || ny >= NY) return false;
            int nc = ny * NX + nx;
            if (!Ok(keep[nc], n) || !Ok(occ[nc], n) || !Ok(occ[N + nc], n)) return false;
        }
        return Ok(occ[cell], n) && Ok(occ[N + cell], n);
    }

    static void AddPadToTree(int pi, bool[] inTree, int[] term)
    {
        for (int c = 0; c < N; c++) if (term[c] == pi + 1) { inTree[c] = true; inTree[N + c] = true; }
    }

    static void Commit(int n, List<int> path, int[] keep, int[] occ, int[] term, bool[] inTree, List<Seg> segs, List<double[]> vias)
    {
        // stub from pad centre to the first/last cell if those are inside a pad
        AddStub(path[0], term, segs);
        AddStub(path[path.Count - 1], term, segs);
        int runStart = 0;
        for (int i = 1; i <= path.Count; i++)
        {
            bool endRun = i == path.Count;
            if (!endRun)
            {
                int a = path[i - 1], b = path[i];
                if (a / N != b / N) endRun = true;                         // layer change
                else if (i - runStart >= 2)
                {
                    int s0 = path[runStart] % N, s1 = path[runStart + 1] % N;
                    if ((b % N) - (a % N) != s1 - s0) endRun = true;          // direction change
                }
            }
            if (endRun)
            {
                int a = path[runStart], b = path[i - 1];
                if (a != b) segs.Add(new Seg { X1 = (a % N % NX) * P, Y1 = (a % N / NX) * P, X2 = (b % N % NX) * P, Y2 = (b % N / NX) * P, Layer = a / N });
                if (i < path.Count && path[i - 1] / N != path[i] / N)
                {
                    int cell = path[i] % N;
                    if (!(term[cell] > 0 && pads[term[cell] - 1].Net == n))
                    {
                        vias.Add(new[] { (cell % NX) * P, (cell / NX) * P });
                        keep[cell] = n;
                        int cx = cell % NX, cy = cell / NX;
                        for (int k = 0; k < 4; k++)
                        {
                            int nx = cx + (k == 0 ? 1 : k == 1 ? -1 : 0), ny = cy + (k == 2 ? 1 : k == 3 ? -1 : 0);
                            int nc = ny * NX + nx;
                            if (keep[nc] == 0) keep[nc] = n; else if (keep[nc] != n) keep[nc] = -1;
                        }
                    }
                    runStart = i;
                }
                else if (i < path.Count) runStart = i - 1;
            }
        }
        foreach (int v in path) { occ[v] = n; inTree[v] = true; }
    }

    static void AddStub(int node, int[] term, List<Seg> segs)
    {
        int cell = node % N;
        if (term[cell] == 0) return;
        var p = pads[term[cell] - 1];
        double x = (cell % NX) * P, y = (cell / NX) * P;
        if (Math.Abs(x - p.X) > 1e-6 || Math.Abs(y - p.Y) > 1e-6)
            segs.Add(new Seg { X1 = p.X, Y1 = p.Y, X2 = x, Y2 = y, Layer = node / N });
    }
}
