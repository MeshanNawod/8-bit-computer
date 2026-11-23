# Part 4: Clock select and halt logic

The three 555 outputs are combined into one clock with a few logic gates:

| Signal | From | Meaning |
|--------|------|---------|
| AST | Astable 555, pin 3 | Free-running square wave |
| MONO | Monostable 555, pin 3 | One pulse per button press |
| SEL | Bistable 555, pin 3 | 1 = manual, 0 = automatic |
| HLT | Control logic | 1 = stop the clock |

## The Boolean equation

"If automatic, pass AST. If manual, pass MONO. Then block everything while
halted."

$$CLK = \big[(AST \cdot \overline{SEL}) + (MONO \cdot SEL)\big] \cdot \overline{HLT}$$

The first part is a **2-to-1 multiplexer** made from gates, with SEL as the
select line.

## Gate-level diagram

```
 SEL ──┬───────────────────────┐
       │                       │
       └─[NOT]── SEL̅ ──┐       │
                       ▼       ▼
 AST ────────────────[AND]   [AND]──────── MONO
                       │       │
                       └─[OR]──┘
                          │
 HLT ──[NOT]── HLT̅ ──────[AND]──┬──────────► CLK
                                └─[NOT]────► CLK̅  (for the instruction register / step counter)
```

## Chips and gate count

| Chip | Gates used | For |
|------|-----------|-----|
| 74LS04 (hex NOT) | 3 of 6 | SEL̅, HLT̅, CLK̅ |
| 74LS08 (quad AND) | 3 of 4 | AST·SEL̅, MONO·SEL, (…)·HLT̅ |
| 74LS32 (quad OR) | 1 of 4 | Combining the two AND outputs |

Tie the **unused inputs** of each chip to GND or VCC. Floating TTL inputs
pick up noise and can make the chip oscillate.

## Truth table

| SEL | HLT | AST | MONO | CLK | Why |
|-----|-----|-----|------|-----|-----|
| 0 | 0 | 0 | x | 0 | auto mode, follows AST |
| 0 | 0 | 1 | x | **1** | auto mode, follows AST |
| 1 | 0 | x | 0 | 0 | manual mode, follows MONO |
| 1 | 0 | x | 1 | **1** | manual mode, follows MONO |
| x | 1 | x | x | 0 | halted |

(x = doesn't matter)

## Timing check

Each 74LS gate adds about **10 ns** of propagation delay (datasheet typ. 9 to
15 ns). The longest path is NOT → AND → OR → AND → NOT, which is 5 gates,
or about 50 ns.
Even at a 500 Hz clock (period 2 ms), 50 ns is only 0.0025 % of a cycle, so
it doesn't matter here.

## Power-supply decoupling

Put a **0.1 µF ceramic capacitor** across VCC and GND at every IC, as close to
the pins as you can. 555 timers draw a big current spike each time they
switch, and without these capacitors the spike can glitch the logic chips
and cause double-clocking.

---
*Design credit: Ben Eater, 8-bit computer clock module.*
