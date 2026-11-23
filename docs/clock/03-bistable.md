# Part 3: Bistable 555 (debounced auto/manual switch)

**Tinkercad:** [Part 3](https://www.tinkercad.com/things/8pzGGpFieEt-bistable-555-timer-8-bit-computer-clock-part-3)

## The problem

We need a switch that picks between the **automatic** clock (astable) and the
**manual** step button (monostable). A plain slide switch bounces too, and a
bounce while switching modes can sneak in extra clock edges.

## The fix: bistable mode (a debounced latch)

In **bistable** mode the 555 is just its internal SR flip-flop. It has **two
stable states** and stays in whichever one it was put into. No timing
resistor or capacitor is involved.

- **TRIG (pin 2) pulled LOW → SET**, output HIGH
- **RST (pin 4) pulled LOW → RESET**, output LOW

Because the flip-flop latches on the first contact, any bounce afterwards
only tries to set it to the state it's already in, so nothing happens.

## Circuit

```
 +5V ──┬──────────┬──────────┐
       │          │          │
    [1k R_a]   [1k R_b]    pin 8 (VCC)
       │          │
       ├─ pin 2   ├─ pin 4
       │ (TRIG)   │ (RST)
       │          │
       o          o      ← SPDT slide switch throws
        \        /
         \  ●   /        ← common pin goes to GND
            │
 GND ───────┴──── pin 1
                  pin 6 (THRES) ── GND   (never resets on its own)
                  pin 5 ──[10 nF]── GND
                  pin 3 ── SEL output ──[220 Ω]──▶|── GND
```

| Part | Value | Role |
|------|-------|------|
| R_a | 1 kΩ | Pull-up on TRIG |
| R_b | 1 kΩ | Pull-up on RST |
| SW | SPDT slide switch | Grounds either TRIG or RST |
| C2 | 10 nF | Control-pin noise filter |
| Pin 6 | tied to GND | Keeps the threshold comparator from ever resetting the latch |
| Pin 7 | unconnected | Not needed |

## Truth table

| Switch position | TRIG | RST | Output (SEL) | Mode |
|-----------------|------|-----|--------------|------|
| Toward TRIG | LOW | HIGH | **HIGH** | Manual (single-step) |
| Toward RST | HIGH | LOW | **LOW** | Automatic (astable) |
| Mid-travel / bouncing | HIGH | HIGH | **holds last value** | — |

## Calculations

| Quantity | Working | Result |
|----------|---------|--------|
| Current through a pull-up when its pin is grounded | 5 V ÷ 1 kΩ | **5 mA** |
| Power in that resistor | 5 V × 5 mA | 25 mW (a ¼ W resistor is fine) |
| TRIG threshold | ⅓ × 5 V | 1.67 V, and grounded is 0 V, well below it |
| RST threshold (datasheet) | ≈ 0.7 V | grounded is 0 V, well below it |

**Why 1 kΩ?** It's low enough to give the pins a solid HIGH and reject noise,
and high enough that the current wasted when the switch grounds a pin is
small.

---
*Design credit: Ben Eater, "Bistable 555 timer" (8-bit computer clock module).*
