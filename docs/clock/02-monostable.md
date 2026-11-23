# Part 2A: Monostable 555 (debounced single-step button)

**Tinkercad:** [Part 2A](https://www.tinkercad.com/things/hLZbnoHB4L6-monostable-555-timer-8-bit-computer-clock-part-2a) ·
Board file: [part2a-monostable.brd](../../hardware/tinkercad/part2a-monostable.brd)

![Part 2A breadboard](../../images/part2a-monostable.png)

## The problem: switch bounce

When you press a push button, its metal contacts **bounce**. They make and
break contact several times over 1 to 10 ms before settling. The computer
would count each bounce as a clock pulse, so one press could advance the
program several steps. We need **one press → exactly one pulse**.

## The fix: monostable mode

In **monostable** mode the 555 has one stable state (output LOW). A trigger
switches the output HIGH for a **fixed time** set by R and C, and then it
returns to LOW by itself. Bounces during that time are ignored, because the
output is already HIGH.

## Connections (from the Tinkercad export)

| 555 pin | Connected to |
|---------|--------------|
| 1 GND | Ground |
| 2 TRIG | R4 (1 kΩ) to +5 V, and push button S1 to ground |
| 3 OUT | Yellow LED D2, then R5 (220 Ω) to ground |
| 4 RESET | +5 V |
| 5 CTRL | C6 (100 nF) to ground |
| 6 THRES and 7 DISCH | Tied together; R6 (1 MΩ) to +5 V, C5 (0.1 µF) to ground |
| 8 VCC | +5 V |

| Part | Value | Role |
|------|-------|------|
| R4 | 1 kΩ | Pull-up: holds TRIG HIGH until the button is pressed |
| S1 | push button | Pulls TRIG to ground |
| R6 | 1 MΩ | Timing resistor |
| C5 | 0.1 µF | Timing capacitor |
| C6 | 100 nF | Noise filter on pin 5 |
| C2, C4 | 0.1 µF | Power-rail decoupling |
| D2 + R5 | yellow LED + 220 Ω | Shows the pulse |

## How it works

1. **Idle:** TRIG is HIGH and the output is LOW. The discharge transistor is
   on, holding C5 at 0 V.
2. **Button pressed:** TRIG drops below ⅓ VCC, so the output goes **HIGH** and
   the discharge transistor turns off.
3. C5 charges through R6 from 0 V. Bounces on TRIG change nothing.
4. At **⅔ VCC** the output goes **LOW** and C5 is emptied again, ready for the
   next press.

## Formula

The capacitor charges from 0 to ⅔ VCC:

$$t = RC \cdot \ln 3 \approx 1.1 \cdot R \cdot C$$

## Calculation

R6 = 1 MΩ, C5 = 0.1 µF

| Step | Working | Result |
|------|---------|--------|
| RC | 1 000 000 × 0.0000001 | 0.1 s |
| Pulse width | 1.0986 × 0.1 s | **≈ 110 ms** |
| Fastest stepping | 1 ÷ 0.110 s | about 9 presses per second |
| Pull-up current when pressed | 5 V ÷ 1 kΩ | 5 mA |

**Why 110 ms works well:** it's about 10× longer than the worst bounce, still
shorter than a fast double-press, and long enough to see the LED flash.

| R | C | Pulse | Notes |
|---|---|-------|-------|
| 1 MΩ | 1 µF | 1.1 s | Very slow stepping |
| **1 MΩ** | **0.1 µF** | **110 ms** | **This build** |
| 100 kΩ | 0.1 µF | 11 ms | Too close to the bounce time |

If you hold the button longer than 110 ms, the output stays HIGH until you
let go. It's still only one pulse per press.

---
*Design credit: Ben Eater, "Monostable 555 timer" (8-bit computer clock module).*
