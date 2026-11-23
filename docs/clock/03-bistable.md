# Part 3: Selecting the clock source (auto / manual)

**Tinkercad:** [Part 3](https://www.tinkercad.com/things/8pzGGpFieEt-bistable-555-timer-8-bit-computer-clock-part-3) ·
Board file: [part3-clock-select.brd](../../hardware/tinkercad/part3-clock-select.brd)

![Part 3 breadboard](../../images/part3-clock-select.png)

Part 3 puts the two earlier circuits on one breadboard and adds a switch to
choose which one drives the clock:

- **U2: astable 555** from [Part 1b](01-astable.md#part-1b-adjustable-speed)
  (R1 1 kΩ, R3 1 kΩ + RPOT2 1 MΩ, C3 1 µF), which is the automatic clock (red
  LED D1).
- **U1: monostable 555** from [Part 2](02-monostable.md) (R6 1 MΩ, C5 0.1 µF,
  button S1), which is the manual single-step (yellow LED D2).
- **S2: SPDT toggle switch** that picks one of the two outputs.
- **D3 + R7 (yellow LED + 220 Ω)** on the switch's common pin, which shows
  the selected clock.

## Circuit as built

```
  U2 (astable)  pin 3 ──┬──▶|D1 red──[R2 220]── GND
                        │
                        └──── S2 pin 1 ─┐
                                        ├─ S2 pin 2 (common) ──▶|D3 yellow──[R7 220]── GND
                        ┌──── S2 pin 3 ─┘                         ▲
                        │                                     "CLK" out
  U1 (monostable) pin 3 ┴──▶|D2 yellow──[R5 220]── GND
```

| Switch position | Common pin connected to | D3 shows | Mode |
|-----------------|------------------------|----------|------|
| Toward pin 1 | U2 output | Free-running pulses | **Automatic** |
| Toward pin 3 | U1 output | One pulse per button press | **Manual step** |

### Shared parts

| Part | Value | Role |
|------|-------|------|
| C1 | 0.1 µF | U2 pin 5 (control voltage) filter |
| C6 | 100 nF | U1 pin 5 filter |
| C2, C4 | 0.1 µF | Power-rail decoupling |
| R8 | 220 Ω | Both leads sit on the same node, so it carries no current and can be removed |

### Calculations

| Quantity | Working | Result |
|----------|---------|--------|
| Auto clock range | from Part 1b | **0.72 Hz to 480 Hz** |
| Manual pulse width | 1.1 × 1 MΩ × 0.1 µF | **110 ms** |
| D3 current | (3.3 − 2.0) V ÷ 220 Ω | ≈ 5.9 mA |
| Load on each 555 output | D1/D2 + D3 | ≈ 12 mA, far below the 555's 200 mA limit |

## The catch: the switch itself bounces

The push button is debounced by the monostable, but the **toggle switch
isn't**. As S2 moves between positions, its contact bounces and briefly
connects and disconnects the clock line, which can produce a few extra
rising edges. Each one would clock the computer.

### The fix: a bistable 555 (next step)

Ben Eater's design solves this with a **third 555 in bistable mode**. That's
just the chip's internal SR flip-flop, with no timing R or C:

```
 +5V ──┬──────────┬──────────┐
       │          │          │
     [1k]       [1k]       pin 8 (VCC)
       │          │
       ├─ pin 2   ├─ pin 4
       │ (TRIG)   │ (RST)
       o          o      ← SPDT switch throws
        \        /
         \  ●   /        ← common pin goes to GND
            │
 GND ───────┴──── pin 1,  pin 6 (THRES) ── GND
                  pin 3 ── SEL (select signal)
```

- **TRIG pulled LOW → SET**, so SEL goes HIGH (manual).
- **RST pulled LOW → RESET**, so SEL goes LOW (auto).
- While the contact bounces, both pins return HIGH for an instant, and the
  flip-flop just **holds** its state. The first contact latches it and the
  bounces after that do nothing.

The switch then only drives SEL, and SEL picks the clock source through
logic gates, with no clock signal running through the mechanical contacts.
See [04-clock-logic.md](04-clock-logic.md).

| Quantity | Working | Result |
|----------|---------|--------|
| Pull-up current when grounded | 5 V ÷ 1 kΩ | 5 mA |
| Power per pull-up | 5 V × 5 mA | 25 mW (¼ W resistor is fine) |
| TRIG threshold | ⅓ × 5 V | 1.67 V, and grounded is 0 V |

---
*Design credit: Ben Eater, 8-bit computer clock module ("Bistable 555 timer" video).*
