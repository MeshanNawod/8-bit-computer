# Part 2: Monostable 555 (debounced single-step button)

**Tinkercad:** [Part 2](https://www.tinkercad.com/things/hLZbnoHB4L6-monostable-555-timer-8-bit-computer-clock-part-2)

## The problem: switch bounce

When you press a mechanical push button, the metal contacts **bounce**. They
make and break contact several times over 1 to 10 ms before they settle:

```
 What you meant:    ‾‾‾‾‾‾‾‾|________________
 What you get:      ‾‾‾‾‾‾‾‾|_|‾|_||‾|________
                            └ bounce ┘
```

The computer would count each bounce as a separate clock pulse, so one press
could advance the program several steps. We need **one press → exactly one
pulse**.

## The fix: monostable mode

In **monostable** mode the 555 has one stable state (output LOW). A trigger
kicks it into the HIGH state for a **fixed time** set by R and C, and then it
returns to LOW on its own. Any bounces during that time are ignored, because
the output is already HIGH.

## Circuit

```
 +5V ──┬─────────┬──────────────┬─────────┐
       │         │              │         │
     [R_T 1k]  pin 8          pin 4      [R]
       │        (VCC)       (RST HIGH)    │
       ├── pin 2 (TRIG)                   ├── pin 7 (DISCH)
       │                                  ├── pin 6 (THRES)
     [BTN]                                │
       │                                 [C]
 GND ──┴──────── pin 1 ───────────────────┘

 pin 5 ──[10 nF]── GND
 pin 3 ── MONO output ──[220 Ω]──▶|── GND
```

| Part | Value | Role |
|------|-------|------|
| R_T | 1 kΩ | Pull-up. Holds TRIG HIGH until the button pulls it LOW |
| BTN | push button | Pulls TRIG to GND when pressed |
| R | 1 MΩ | Timing resistor |
| C | 1 µF | Timing capacitor |
| C2 | 10 nF | Control-pin noise filter |

## How it works, step by step

1. **Idle:** TRIG is held HIGH by R_T and the output is LOW. The discharge
   transistor is ON, which keeps C shorted at 0 V.
2. **Button pressed:** TRIG drops below ⅓ VCC, the flip-flop is set, and the
   output goes **HIGH**. The discharge transistor turns **OFF**.
3. C charges through R from **0 V** toward VCC. Contact bounces on TRIG
   change nothing, because the flip-flop is already set.
4. When V_C reaches **⅔ VCC**, the threshold comparator resets the
   flip-flop. The output goes **LOW**, the discharge transistor dumps C back
   to 0 V, and the circuit is ready for the next press.

## Formula

The capacitor charges from 0 to ⅔ VCC (see [555-timer.md](../basics/555-timer.md)):

$$t = RC \cdot \ln\left(\frac{V_{CC} - 0}{V_{CC} - \tfrac{2}{3}V_{CC}}\right) = RC \ln 3 \approx \mathbf{1.1 \cdot R \cdot C}$$

## Calculation

R = 1 MΩ, C = 1 µF

| Step | Working | Result |
|------|---------|--------|
| Time constant RC | 1 000 000 × 1×10⁻⁶ | 1.0 s |
| Pulse width | 1.0986 × 1.0 s | **≈ 1.1 s** |
| Pull-up current when pressed | 5 V ÷ 1 kΩ | 5 mA |

### Choosing the pulse width

- It must be **longer than the bounce** (> ~10 ms), or bounces leak through.
- It must be **shorter than you can press the button twice**, or presses get
  lost.

| R | C | Pulse width | Notes |
|---|---|-------------|-------|
| 1 MΩ | 1 µF | 1.1 s | Very visible on the LED, slow stepping |
| 100 kΩ | 1 µF | 110 ms | Good balance |
| 10 kΩ | 1 µF | 11 ms | Close to the bounce limit, risky |

## Caveat: holding the button down

If you hold the button longer than t, TRIG is still LOW when the timer ends,
so the output stays HIGH until you let go. That's fine for single-stepping.
The pulse is always *at least* t long, and still only one pulse per press.

---
*Design credit: Ben Eater, "Monostable 555 timer" (8-bit computer clock module).*
