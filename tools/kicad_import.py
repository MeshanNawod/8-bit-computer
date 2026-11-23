"""Convert one routed Eagle .brd into a KiCad .kicad_pcb.

Run with KiCad's own Python (one board per call):
  "C:\\Program Files\\KiCad\\10.0\\bin\\python.exe" tools/kicad_import.py hardware/pcb/part1a-astable.brd hardware/kicad/part1a-astable.kicad_pcb
"""
import sys

import pcbnew

src, dst = sys.argv[1], sys.argv[2]
mgr = pcbnew.PCB_IO_MGR
board = mgr.Load(mgr.EAGLE, src)
print(f"{src}: {len(board.GetFootprints())} footprints, {len(board.GetTracks())} tracks/vias", flush=True)
mgr.Save(mgr.KICAD_SEXP, dst, board)
