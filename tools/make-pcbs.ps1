# Builds routed PCB versions of the Tinkercad exports.
# Input:  hardware/tinkercad/*.brd  (netlist from Tinkercad, parts at breadboard spots, unrouted)
# Output: hardware/pcb/*.brd        (same netlist, tidy placement, 2-layer routed copper)
# Placement is "Ref:x,y,rotation" in mm; the router lives in BoardRouter.cs.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Add-Type -Path (Join-Path $PSScriptRoot 'BoardRouter.cs') -ReferencedAssemblies System.Xml

$out = Join-Path $root 'hardware\pcb'
New-Item -ItemType Directory -Force $out | Out-Null

# Astable block: 555, timing parts, CV cap, LED, decoupling
$astable1a = 'U1:23,22,0;R1:33,29,90;R2:38,20,270;C3:31,10,0;C1:31,16,0;D1:11,18,0;R3:11,11,0;C4:23,32,0;P1:9,36,0;C2:9,30,0'
$astable1b = 'U1:23,22,0;R1:33,29,90;R4:38,28,90;RPOT1:41,15,0;C3:31,10,0;C1:31,16,0;D1:11,18,0;R3:11,11,0;C4:23,32,0;P1:9,36,0;C2:9,30,0'
$mono2     = 'U1:23,22,0;R4:11,30,270;S1:9,16,180;R6:33,29,90;C5:33,14,0;C6:33,18.5,0;D2:19,10.5,0;R5:29,4.5,180;C4:23,32,0;P1:23,38,0;C2:33,38.5,0'
$part3     = 'U2:23,22,0;R1:33,29,90;R3:38,28,90;RPOT2:41,15,0;C3:31,10,0;C1:31,16,0;D1:11,18,0;R2:11,11,0;C4:23,32,0;' +
             'U1:66,22,0;R4:54,30,270;S1:52,16,180;R6:76,29,90;C5:76,14,0;C6:76,18.5,0;D2:62,10.5,0;R5:72,4.5,180;C2:66,32,0;' +
             'P1:9,41,0;S2:44,41,0;D3:52,41,0;R7:62,41,0;R8:76,41,0'

$jobs = @(
  @{ in = 'part1a-astable.brd';     spec = $astable1a; w = 46; h = 41 },
  @{ in = 'part1b-astable-pot.brd'; spec = $astable1b; w = 47; h = 41 },
  @{ in = 'part2-monostable.brd';   spec = $mono2;     w = 38; h = 43 },
  @{ in = 'part3-clock-select.brd'; spec = $part3;     w = 84; h = 46 }
)
foreach ($j in $jobs) {
  $src = Join-Path $root "hardware\tinkercad\$($j.in)"
  $dst = Join-Path $out $j.in
  [BoardRouter]::Run($src, $dst, $j.spec, $j.w, $j.h, 40)
}
