/**
 * L298N Motor Driver blocks for micro:bit + Sensor:bit
 *
 * Wiring assumption: jumpers left in place on ENA / ENB,
 * so speed is controlled by PWM directly on IN1-IN4.
 *
 *   IN1 / IN2  ->  Motor A (left wheel)
 *   IN3 / IN4  ->  Motor B (right wheel)
 */

enum MotorSide {
    //% block="left wheel"
    //% block.loc.th="ล้อซ้าย"
    Left = 0,
    //% block="right wheel"
    //% block.loc.th="ล้อขวา"
    Right = 1
}

enum MotorDir {
    //% block="forward"
    //% block.loc.th="เดินหน้า"
    Forward = 0,
    //% block="backward"
    //% block.loc.th="ถอยหลัง"
    Backward = 1
}

//% weight=100 color=#E63946 icon="\uf1b9"
//% block="L298 Motor"
//% block.loc.th="มอเตอร์ L298"
//% groups="['Setup', 'Drive', 'Advanced']"
//% groups.loc.th="['เริ่มต้น', 'ขับเคลื่อน', 'ขั้นสูง']"
namespace l298 {

    let pinIN1 = DigitalPin.P13
    let pinIN2 = DigitalPin.P14
    let pinIN3 = DigitalPin.P15
    let pinIN4 = DigitalPin.P16
    let pwmPeriodUs = 1000
    let minPower = 0

    // ---------- internal helpers (not exposed as blocks) ----------

    function toPwm(percent: number): number {
        let p = Math.constrain(percent, 0, 100)
        if (p > 0 && minPower > 0) {
            p = Math.map(p, 0, 100, minPower, 100)
        }
        return Math.round(Math.map(p, 0, 100, 0, 1023))
    }

    function drive(pinPwm: DigitalPin, pinLow: DigitalPin, speed: number) {
        pins.digitalWritePin(pinLow, 0)
        pins.analogWritePin(<AnalogPin><number>pinPwm, toPwm(speed))
        pins.analogSetPeriod(<AnalogPin><number>pinPwm, pwmPeriodUs)
    }

    function coast(pinA: DigitalPin, pinB: DigitalPin) {
        pins.digitalWritePin(pinA, 0)
        pins.digitalWritePin(pinB, 0)
    }

    // ---------- group: Setup ----------

    /**
     * Set the pins wired to the L298 module and stop both motors.
     * Always place this block inside "on start".
     * @param in1 pin wired to IN1
     * @param in2 pin wired to IN2
     * @param in3 pin wired to IN3
     * @param in4 pin wired to IN4
     */
    //% blockId=l298_setup
    //% block="set motor pins IN1 %in1 IN2 %in2 IN3 %in3 IN4 %in4"
    //% block.loc.th="ตั้งค่ามอเตอร์ IN1 %in1 IN2 %in2 IN3 %in3 IN4 %in4"
    //% jsdoc.loc.th="กำหนดขาที่ต่อกับ L298 แล้วหยุดมอเตอร์ทั้งสองข้าง ให้วางบล็อกนี้ไว้ใน on start เสมอ"
    //% in1.defl=DigitalPin.P13
    //% in2.defl=DigitalPin.P14
    //% in3.defl=DigitalPin.P15
    //% in4.defl=DigitalPin.P16
    //% inlineInputMode=external
    //% weight=100 blockGap=8
    //% group="Setup"
    export function setup(in1: DigitalPin, in2: DigitalPin, in3: DigitalPin, in4: DigitalPin): void {
        pinIN1 = in1
        pinIN2 = in2
        pinIN3 = in3
        pinIN4 = in4
        stop()
    }

    // ---------- group: Drive ----------

    /**
     * Drive both wheels forward.
     * @param speed speed from 0 to 100 percent
     */
    //% blockId=l298_forward
    //% block="drive forward at %speed \\%"
    //% block.loc.th="เดินหน้า ความเร็ว %speed \\%"
    //% jsdoc.loc.th="เดินหน้าทั้งสองล้อ"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=95
    //% group="Drive"
    export function forward(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Forward, speed)
        runMotor(MotorSide.Right, MotorDir.Forward, speed)
    }

    /**
     * Drive both wheels backward.
     * @param speed speed from 0 to 100 percent
     */
    //% blockId=l298_backward
    //% block="drive backward at %speed \\%"
    //% block.loc.th="ถอยหลัง ความเร็ว %speed \\%"
    //% jsdoc.loc.th="ถอยหลังทั้งสองล้อ"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=90
    //% group="Drive"
    export function backward(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Backward, speed)
        runMotor(MotorSide.Right, MotorDir.Backward, speed)
    }

    /**
     * Spin left on the spot: left wheel backward, right wheel forward.
     * @param speed speed from 0 to 100 percent
     */
    //% blockId=l298_turn_left
    //% block="turn left at %speed \\%"
    //% block.loc.th="เลี้ยวซ้าย ความเร็ว %speed \\%"
    //% jsdoc.loc.th="เลี้ยวซ้ายแบบหมุนอยู่กับที่ (ล้อซ้ายถอย ล้อขวาเดินหน้า)"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=85
    //% group="Drive"
    export function turnLeft(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Backward, speed)
        runMotor(MotorSide.Right, MotorDir.Forward, speed)
    }

    /**
     * Spin right on the spot: left wheel forward, right wheel backward.
     * @param speed speed from 0 to 100 percent
     */
    //% blockId=l298_turn_right
    //% block="turn right at %speed \\%"
    //% block.loc.th="เลี้ยวขวา ความเร็ว %speed \\%"
    //% jsdoc.loc.th="เลี้ยวขวาแบบหมุนอยู่กับที่ (ล้อซ้ายเดินหน้า ล้อขวาถอย)"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=80
    //% group="Drive"
    export function turnRight(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Forward, speed)
        runMotor(MotorSide.Right, MotorDir.Backward, speed)
    }

    /**
     * Stop both motors and let them coast.
     */
    //% blockId=l298_stop
    //% block="stop motors"
    //% block.loc.th="หยุดมอเตอร์"
    //% jsdoc.loc.th="หยุดมอเตอร์ทั้งสองข้าง (ปล่อยให้ไหลอิสระ)"
    //% weight=75
    //% group="Drive"
    export function stop(): void {
        coast(pinIN1, pinIN2)
        coast(pinIN3, pinIN4)
    }

    /**
     * Drive forward for a set time, then stop automatically.
     * @param speed speed from 0 to 100 percent
     * @param ms duration in milliseconds
     */
    //% blockId=l298_forward_for
    //% block="drive forward at %speed \\% for %ms ms"
    //% block.loc.th="เดินหน้า ความเร็ว %speed \\% เป็นเวลา %ms ms"
    //% jsdoc.loc.th="เดินหน้าตามเวลาที่กำหนด แล้วหยุดเอง"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% ms.shadow=timePicker ms.defl=1000
    //% weight=70
    //% group="Drive"
    export function forwardFor(speed: number, ms: number): void {
        forward(speed)
        basic.pause(ms)
        stop()
    }

    /**
     * Drive both wheels with independent speeds.
     * Positive = forward, negative = backward, 0 = stop that wheel.
     * @param left left wheel speed from -100 to 100
     * @param right right wheel speed from -100 to 100
     */
    //% blockId=l298_tank
    //% block="drive left wheel %left \\% right wheel %right \\%"
    //% block.loc.th="ขับ ล้อซ้าย %left \\% ล้อขวา %right \\%"
    //% jsdoc.loc.th="ขับสองล้อพร้อมกัน กำหนดความเร็วแยกกันได้ ค่าบวกคือเดินหน้า ค่าลบคือถอยหลัง 0 คือหยุดล้อนั้น"
    //% left.min=-100 left.max=100 left.defl=60
    //% right.min=-100 right.max=100 right.defl=60
    //% inlineInputMode=inline
    //% weight=65 blockGap=24
    //% group="Drive"
    export function tank(left: number, right: number): void {
        wheel(MotorSide.Left, left)
        wheel(MotorSide.Right, right)
    }

    // ---------- group: Advanced ----------

    /**
     * Drive one wheel. Positive = forward, negative = backward, 0 = stop.
     * @param side which wheel
     * @param speed speed from -100 to 100
     */
    //% blockId=l298_wheel
    //% block="drive %side at %speed \\%"
    //% block.loc.th="ขับ %side ความเร็ว %speed \\%"
    //% jsdoc.loc.th="ขับล้อเดียว ค่าบวกคือเดินหน้า ค่าลบคือถอยหลัง 0 คือหยุด"
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% weight=62
    //% group="Advanced"
    export function wheel(side: MotorSide, speed: number): void {
        let s = Math.constrain(speed, -100, 100)
        if (s > 0) {
            runMotor(side, MotorDir.Forward, s)
        } else if (s < 0) {
            runMotor(side, MotorDir.Backward, -s)
        } else {
            stopSide(side)
        }
    }

    /**
     * Run one wheel with an explicit direction.
     * @param side which wheel
     * @param dir direction
     * @param speed speed from 0 to 100 percent
     */
    //% blockId=l298_run_motor
    //% block="run %side %dir at %speed \\%"
    //% block.loc.th="หมุน %side %dir ความเร็ว %speed \\%"
    //% jsdoc.loc.th="สั่งมอเตอร์ทีละล้อ โดยเลือกทิศทางจาก dropdown"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=60
    //% group="Advanced"
    export function runMotor(side: MotorSide, dir: MotorDir, speed: number): void {
        let a = side == MotorSide.Left ? pinIN1 : pinIN3
        let b = side == MotorSide.Left ? pinIN2 : pinIN4
        if (dir == MotorDir.Forward) {
            drive(a, b, speed)
        } else {
            drive(b, a, speed)
        }
    }

    /**
     * Stop one wheel.
     * @param side which wheel
     */
    //% blockId=l298_stop_side
    //% block="stop %side"
    //% block.loc.th="หยุด %side"
    //% jsdoc.loc.th="หยุดมอเตอร์ทีละล้อ"
    //% weight=55
    //% group="Advanced"
    export function stopSide(side: MotorSide): void {
        if (side == MotorSide.Left) {
            coast(pinIN1, pinIN2)
        } else {
            coast(pinIN3, pinIN4)
        }
    }

    /**
     * Brake both motors by pulling both IN pins HIGH.
     * Stops faster than the coast-based stop block, but more abruptly.
     */
    //% blockId=l298_brake
    //% block="brake motors"
    //% block.loc.th="เบรกมอเตอร์"
    //% jsdoc.loc.th="เบรกมอเตอร์ทั้งสองข้าง หยุดเร็วกว่าบล็อกหยุดมอเตอร์ แต่กระชากกว่า"
    //% weight=50
    //% group="Advanced"
    export function brake(): void {
        pins.digitalWritePin(pinIN1, 1)
        pins.digitalWritePin(pinIN2, 1)
        pins.digitalWritePin(pinIN3, 1)
        pins.digitalWritePin(pinIN4, 1)
    }

    /**
     * Set the minimum power at which the motors actually start moving.
     * Use 0 to disable the compensation.
     * @param percent minimum power from 0 to 80 percent
     */
    //% blockId=l298_set_min_power
    //% block="set minimum power to %percent \\%"
    //% block.loc.th="ตั้งกำลังขั้นต่ำ %percent \\%"
    //% jsdoc.loc.th="ตั้งกำลังขั้นต่ำที่มอเตอร์เริ่มออกตัวได้ ถ้าสั่งความเร็วน้อย ๆ แล้วรถไม่ขยับ ให้ลองตั้งที่ 35-45"
    //% percent.min=0 percent.max=80 percent.defl=35
    //% weight=48
    //% group="Advanced"
    export function setMinPower(percent: number): void {
        minPower = Math.constrain(percent, 0, 80)
    }

    /**
     * Set the PWM frequency. Default is 1000 Hz.
     * The L298 is a BJT bridge, so avoid going above 2000 Hz.
     * @param hz frequency in Hz
     */
    //% blockId=l298_set_frequency
    //% block="set PWM frequency to %hz Hz"
    //% block.loc.th="ตั้งความถี่ PWM %hz Hz"
    //% jsdoc.loc.th="ตั้งความถี่ PWM ค่าเริ่มต้นคือ 1000 Hz ไม่ควรเกิน 2000 Hz"
    //% hz.min=100 hz.max=2000 hz.defl=1000
    //% weight=45
    //% group="Advanced"
    export function setFrequency(hz: number): void {
        pwmPeriodUs = Math.round(1000000 / Math.constrain(hz, 100, 2000))
    }
}