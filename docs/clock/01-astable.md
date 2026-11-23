# Part 1: Astable 555 (free-running clock)

**Tinkercad:**
[Part 1a](https://www.tinkercad.com/things/l30rW27OBnZ-astable-555-timer-8-bit-computer-clock-part-1-a) ·
[Part 1b](https://www.tinkercad.com/things/5Rx0vSOaq2a-astable-555-timer-8-bit-computer-clock-part-1b-)

In **astable** mode the 555 has no stable state. It keeps flipping its
output HIGH and LOW by itself, which produces a square wave. That square
wave is the automatic clock.

## Circuit

```
 +5V ──┬────────────┬──────────┐
       │            │          │
      [R1]        pin 8      pin 4 (RST tied HIGH)
       │          (VCC)
       ├──────── pin 7 (DISCH)
       │
      [R2]
       │
       ├──────── pin 6 (THRES) ─┐
       │                        ├─ tied together
       ├──────── pin 2 (TRIG) ──┘
       │
      [C1]                pin 5 ──[10 nF]── GND
       │                  pin 3 ──[220 Ω]──▶|── GND   (clock LED)
 GND ──┴───────── pin 1
```

| Part | Value | Role |
|------|-------|------|
| R1 | 1 kΩ | Charge path from VCC to the discharge pin |
| R2 | 100 kΩ (1a) / 1 MΩ potentiometer (1b) | Sets most of the timing |
| C1 | 1 µF | Timing capacitor |
| C2 | 10 nF | Filters noise on the control-voltage pin |
| LED + 220 Ω | — | Shows the clock pulses |

## How it works, step by step

1. At power-on C1 is empty (0 V). TRIG (pin 2) is below ⅓ VCC, so the
   output goes **HIGH** and the discharge transistor turns **off**.
2. C1 **charges** through **R1 + R2**.
3. When V_C reaches **⅔ VCC (3.33 V)**, the threshold comparator fires. The
   output goes **LOW** and the discharge transistor turns **on**.
4. C1 now **discharges** through **R2 only**, into pin 7.
5. When V_C falls to **⅓ VCC (1.67 V)**, the trigger comparator fires. The
   output goes **HIGH** again, the discharge transistor turns off, and the
   cycle repeats from step 2.

The capacitor voltage moves back and forth between 1.67 V and 3.33 V:

```
 V_C  3.33 ┤   /\    /\    /\
           │  /  \  /  \  /  \
      1.67 ┤ /    \/    \/    \
           │/
 OUT    5  ┤ ┌───┐  ┌───┐  ┌───┐
        0  ┤─┘   └──┘   └──┘   └──
             t_H  t_L
```

## Formulas

From the RC charging formula (see [555-timer.md](../basics/555-timer.md)),
moving between ⅓ and ⅔ VCC always takes **ln 2 ≈ 0.693** time constants:

| Quantity | Formula |
|----------|---------|
| HIGH time (charging through R1 + R2) | t_H = 0.693 × (R1 + R2) × C |
| LOW time (discharging through R2) | t_L = 0.693 × R2 × C |
| Period | T = t_H + t_L = 0.693 × (R1 + 2R2) × C |
| Frequency | f = 1 / T = **1.44 / ((R1 + 2R2) × C)** |
| Duty cycle | D = t_H / T = (R1 + R2) / (R1 + 2R2) |

## Part 1a: fixed resistors

R1 = 1 kΩ, R2 = 100 kΩ, C = 1 µF

| Step | Working | Result |
|------|---------|--------|
| t_H | 0.693 × (1 000 + 100 000) × 1×10⁻⁶ | **70.0 ms** |
| t_L | 0.693 × 100 000 × 1×10⁻⁶ | **69.3 ms** |
| T | 70.0 + 69.3 | **139.3 ms** |
| f | 1 ÷ 0.1393 | **7.18 Hz** |
| Duty cycle | 101 k ÷ 201 k | **50.2 %** |

**Why R1 is small:** the duty cycle can never be exactly 50 %, because the
HIGH time always includes R1. Keeping R1 much smaller than R2 brings it close
to 50 %, so HIGH and LOW are roughly equal, which is what a clock should look
like.

**Why R1 can't be 0:** when the discharge transistor turns on, it would short
VCC straight to ground. 1 kΩ limits that current to 5 V ÷ 1 kΩ = **5 mA**.

## Part 1b: adjustable speed

R2 becomes a **1 MΩ potentiometer**, so you can turn a knob to change the
clock speed.

| Pot setting | R2 | t_H | t_L | f | Duty |
|-------------|----|-----|-----|---|------|
| Max | 1 MΩ | 0.694 s | 0.693 s | **0.72 Hz** | 50.0 % |
| ½ | 500 kΩ | 0.347 s | 0.347 s | **1.44 Hz** | 50.1 % |
| 10 % | 100 kΩ | 70.0 ms | 69.3 ms | **7.18 Hz** | 50.2 % |
| 1 % | 10 kΩ | 7.62 ms | 6.93 ms | **68.7 Hz** | 52.4 % |
| Min | ≈ 0 Ω | 0.693 ms | ≈ 0 | → ≈ 1.4 kHz (in theory) | → 100 % |

At the very bottom of the pot's travel the LOW time shrinks toward zero. If
you need a well-defined maximum speed, add a small fixed resistor (for
example 1 kΩ) in series with the pot. That gives
f_max = 1.44 ÷ (3 kΩ × 1 µF) = **480 Hz** with a 66.7 % duty cycle.

**Want it faster?** Swap C for 0.1 µF and every frequency goes up 10×.

## Checking it in the simulation

- The LED on pin 3 should blink at the calculated rate (about 7 per second for 1a).
- Turning the pot (1b) should change the speed smoothly from about 0.7 Hz upward.
- Put Tinkercad's oscilloscope on pin 3 to measure t_H and t_L and compare them with the table.

---
*Design credit: Ben Eater, "Astable 555 timer" (8-bit computer clock module).*
