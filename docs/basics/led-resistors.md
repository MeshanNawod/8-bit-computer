# LED current-limiting resistors

Every LED needs a series resistor, otherwise it draws as much current as the
source can give and burns out.

$$R = \frac{V_{source} - V_F}{I_{LED}}$$

| LED colour | Typical V_F |
|------------|-------------|
| Red | 1.8 – 2.0 V |
| Yellow / green | 2.0 – 2.2 V |
| Blue / white | 3.0 – 3.3 V |

## Worked examples

### LED on the 555 output (pin 3)

The 555's HIGH output is about VCC − 1.7 V ≈ **3.3 V** when it supplies
current.

- With 220 Ω: I = (3.3 − 2.0) ÷ 220 = **5.9 mA**, which is plenty bright.
- With 330 Ω: I = (3.3 − 2.0) ÷ 330 = **3.9 mA**.

### LED driven by a 74LS gate

A 74LS output can only *source* about 0.4 mA reliably when HIGH, but it can
*sink* 8 mA when LOW. The bus LEDs in the full computer use 220 Ω and run
dim but visible. For brighter LEDs, drive them through a transistor (see
[transistors-and-gates.md](transistors-and-gates.md)).

### Power LED straight from 5 V

R = (5 − 2.0) ÷ 220 = **13.6 mA**, which stays under the 20 mA rating.
