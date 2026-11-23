# Transistors as switches, and logic gates built from them

Every 74LS chip in this computer is made of transistors. A 74LS08 (quad AND)
has a few dozen inside. This page shows how a single NPN transistor works as
a switch, and how a few of them make the NOT, AND and OR gates used in the
clock module.

## The NPN transistor as a switch (2N3904 / BC547)

```
            +5V
             │
            [R_C]  ← load (or an LED + resistor)
             │
             ├──── C (collector)
   IN ──[R_B]──── B (base)      NPN
             ├──── E (emitter)
             │
            GND
```

- **Base below ~0.7 V:** no base current flows, the transistor is **OFF**, and
  the collector-emitter path is open.
- **Base current flowing:** the transistor is **ON (saturated)**. The
  collector drops to about 0.2 V (V_CE(sat)), close to ground.

### Calculation: base resistor to drive an LED

Goal: switch a 20 mA LED from a 5 V logic signal.

| Quantity | Value | Where it comes from |
|----------|-------|---------------------|
| Collector current I_C | 20 mA | LED rated current |
| Minimum current gain h_FE | 100 | 2N3904 datasheet at 10 mA |
| Minimum base current | I_C ÷ h_FE = 20 mA ÷ 100 = **0.2 mA** | |
| Base current with 5× overdrive | **1 mA** | Overdrive guarantees full saturation |
| Base resistor | R_B = (V_IN − V_BE) ÷ I_B = (5 − 0.7) ÷ 1 mA = **4.3 kΩ** | |
| Standard value | **4.7 kΩ** → I_B = 4.3 ÷ 4.7k = 0.91 mA | still more than 4× the minimum |

LED series resistor (red LED, V_F ≈ 2.0 V):
R = (5 − 2.0 − 0.2) ÷ 20 mA = **140 Ω → use 150 Ω**.

## NOT gate (inverter): one transistor

```
 +5V ──[1k R_C]──┬── OUT
                 │
 IN ──[4.7k]── B  NPN
                 │
                GND
```

| IN | Transistor | OUT |
|----|-----------|-----|
| 0 | OFF → R_C pulls OUT up | **1** |
| 1 | ON → OUT pulled to ~0.2 V | **0** |

This is what one of the six gates inside a **74LS04** does (it uses a more
elaborate TTL design, but the idea is the same).

## AND gate: two transistors in series

```
 +5V ─────────┐
              C
 A ──[4.7k]── B   Q1
              E
              │
              C
 B ──[4.7k]── B   Q2
              E
              ├──── OUT
            [1k]
              │
             GND
```

Current only reaches the output resistor when **both** Q1 **and** Q2 are on.

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | **1** |

## OR gate: two transistors in parallel

```
 +5V ─────┬──────────┐
          C          C
 A ─[4.7k]B Q1  B ─[4.7k]B Q2
          E          E
          └────┬─────┘
               ├──── OUT
             [1k]
               │
              GND
```

Either transistor turning on pulls OUT high.

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | **1** |
| 1 | 0 | **1** |
| 1 | 1 | **1** |

## Why we switch to ICs

Building gates from discrete transistors (**RTL**, resistor-transistor logic)
is a great way to learn, but it has drawbacks:

- The output voltage sags under load (one emitter-follower stage loses about
  0.7 V per gate).
- Each gate needs 3 to 5 parts and a lot of board space.
- It is slow and uses a lot of power compared with TTL.

So the computer uses **74LS-series TTL** chips. Each one packs several gates
with proper output stages into a single 14-pin package:

| Chip | Contents | Used in |
|------|----------|---------|
| 74LS04 | 6 × NOT | Clock logic |
| 74LS08 | 4 × 2-input AND | Clock logic |
| 74LS32 | 4 × 2-input OR | Clock logic |
| 74LS00 | 4 × 2-input NAND | Various |

TTL logic levels at 5 V: input LOW < **0.8 V**, input HIGH > **2.0 V**.
Output LOW < **0.5 V**, output HIGH > **2.7 V**.
