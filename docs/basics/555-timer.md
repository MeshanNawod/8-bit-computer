# How the 555 timer works

The NE555 is the chip behind all three parts of the clock module. Knowing what
is inside it makes every formula in this repo easy to follow.

## Pinout

```
        ┌───∪───┐
  GND 1 │       │ 8 VCC
 TRIG 2 │  555  │ 7 DISCH
  OUT 3 │       │ 6 THRES
  RST 4 │       │ 5 CTRL
        └───────┘
```

| Pin | Name | What it does |
|-----|------|--------------|
| 1 | GND | 0 V |
| 2 | TRIG (trigger) | When this drops **below ⅓ VCC**, the output goes HIGH |
| 3 | OUT | Output, about VCC − 1.7 V when HIGH and about 0.1 V when LOW |
| 4 | RST (reset) | Active LOW. Pulling it to 0 V forces the output LOW. Tie it to VCC when you don't use it |
| 5 | CTRL (control voltage) | Gives you access to the ⅔ VCC reference point. Put a 0.01 to 0.1 µF capacitor from here to GND to filter out noise (this build uses 0.1 µF) |
| 6 | THRES (threshold) | When this rises **above ⅔ VCC**, the output goes LOW |
| 7 | DISCH (discharge) | An open-collector transistor that connects to GND whenever the output is LOW |
| 8 | VCC | +5 V (works from 4.5 to 16 V) |

## Inside the chip

```
 VCC ──┬───────────────────────────────────────────┐
       5k                                          │
       ├──── (2/3 VCC) ──► [Comparator 1] ─ R ┐    │
       5k        THRES(6) ─►                  │    │
       ├──── (1/3 VCC) ──► [Comparator 2] ─ S ┼─► [SR flip-flop] ─► output stage ─► OUT(3)
       5k        TRIG(2)  ─►                  │         │
 GND ──┘                          RST(4) ─────┘         └─► discharge transistor ─► DISCH(7)
```

1. **Three equal resistors** (the original chip used 5 kΩ, which is one
   theory for the "555" name) split VCC into reference points at **⅓ VCC**
   and **⅔ VCC**.
2. **Comparator 1** checks whether THRES > ⅔ VCC. If it is, it **resets** the
   flip-flop and the output goes LOW.
3. **Comparator 2** checks whether TRIG < ⅓ VCC. If it is, it **sets** the
   flip-flop and the output goes HIGH.
4. The **SR flip-flop** remembers the last state, so the output stays where it
   is until one comparator fires again.
5. The **discharge transistor** (an NPN inside the chip) switches on while the
   output is LOW, which gives a capacitor a path to drain to ground.

With VCC = 5 V the two thresholds are:

- ⅓ × 5 V = **1.67 V**
- ⅔ × 5 V = **3.33 V**

## The RC charging formula behind every timing equation

A capacitor charging through a resistor toward a supply voltage follows:

$$V_C(t) = V_{final} - (V_{final} - V_{start})\,e^{-t/RC}$$

Solve for the time it takes to get from `V_start` to `V_end`:

$$t = RC \cdot \ln\!\left(\frac{V_{final} - V_{start}}{V_{final} - V_{end}}\right)$$

Two cases come up in this project:

| Case | V_start | V_end | V_final | ln(...) | Time |
|------|---------|-------|---------|---------|------|
| **Astable** (charges between ⅓ and ⅔) | ⅓ VCC | ⅔ VCC | VCC | ln(⅔ ÷ ⅓) = ln 2 = **0.693** | t = 0.693 RC |
| **Monostable** (charges from 0 to ⅔) | 0 | ⅔ VCC | VCC | ln(1 ÷ ⅓) = ln 3 = **1.0986** | t ≈ 1.1 RC |

Discharging from ⅔ VCC down to ⅓ VCC (toward 0 V) also gives
ln(⅔ ÷ ⅓) = ln 2, so it takes 0.693 RC as well.

Notice that **VCC cancels out**. The timing doesn't depend on the supply
voltage, which is one reason the 555 is so popular.

## The three modes used in the clock

| Mode | Stable states | What it's used for | Doc |
|------|---------------|--------------------|-----|
| Astable | none (it keeps flipping) | Free-running clock | [01-astable.md](../clock/01-astable.md) |
| Monostable | one (it returns to LOW) | One clean pulse per button press | [02-monostable.md](../clock/02-monostable.md) |
| Bistable | two (it stays where you put it) | Debounced auto/manual switch | [03-bistable.md](../clock/03-bistable.md) |
