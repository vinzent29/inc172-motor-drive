/**
 * L298N Motor Driver blocks สำหรับ micro:bit + Sensor:bit
 *
 * เงื่อนไขการต่อวงจร: ใส่ jumper ค้างไว้ที่ ENA / ENB
 * จึงคุมความเร็วด้วย PWM ที่ขา IN1-IN4 โดยตรง
 *
 *   IN1 / IN2  ->  Motor A (ล้อซ้าย)
 *   IN3 / IN4  ->  Motor B (ล้อขวา)
 */

enum MotorSide {
    //% block="ล้อซ้าย"
    Left = 0,
    //% block="ล้อขวา"
    Right = 1
}

enum MotorDir {
    //% block="เดินหน้า"
    Forward = 0,
    //% block="ถอยหลัง"
    Backward = 1
}

//% weight=100 color=#E63946 icon="\uf1b9" block="มอเตอร์ L298"
//% groups="['เริ่มต้น', 'ขับเคลื่อน', 'ขั้นสูง']"
namespace l298 {

    let pinIN1 = DigitalPin.P13
    let pinIN2 = DigitalPin.P14
    let pinIN3 = DigitalPin.P15
    let pinIN4 = DigitalPin.P16
    let pwmPeriodUs = 1000
    let minPower = 0

    // ---------- ฟังก์ชันภายใน (ไม่กลายเป็นบล็อก) ----------

    function toPwm(percent: number): number {
        let p = Math.constrain(percent, 0, 100)
        if (p > 0 && minPower > 0) {
            // ยกช่วงล่างขึ้นให้พ้นจุดที่มอเตอร์ยังไม่ออกตัว
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

    // ---------- กลุ่ม: เริ่มต้น ----------

    /**
     * กำหนดขาที่ต่อกับ L298 แล้วหยุดมอเตอร์ทั้งสองข้าง
     * ให้วางบล็อกนี้ไว้ใน "on start" เสมอ
     * @param in1 ขาที่ต่อกับ IN1
     * @param in2 ขาที่ต่อกับ IN2
     * @param in3 ขาที่ต่อกับ IN3
     * @param in4 ขาที่ต่อกับ IN4
     */
    //% blockId=l298_setup
    //% block="ตั้งค่ามอเตอร์ IN1 %in1 IN2 %in2 IN3 %in3 IN4 %in4"
    //% in1.defl=DigitalPin.P13
    //% in2.defl=DigitalPin.P14
    //% in3.defl=DigitalPin.P15
    //% in4.defl=DigitalPin.P16
    //% inlineInputMode=external
    //% weight=100 blockGap=8
    //% group="เริ่มต้น"
    export function setup(in1: DigitalPin, in2: DigitalPin, in3: DigitalPin, in4: DigitalPin): void {
        pinIN1 = in1
        pinIN2 = in2
        pinIN3 = in3
        pinIN4 = in4
        stop()
    }

    // ---------- กลุ่ม: ขับเคลื่อน ----------

    /**
     * เดินหน้าทั้งสองล้อ
     * @param speed ความเร็ว 0-100 เปอร์เซ็นต์
     */
    //% blockId=l298_forward
    //% block="เดินหน้า ความเร็ว %speed \\%"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=95
    //% group="ขับเคลื่อน"
    export function forward(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Forward, speed)
        runMotor(MotorSide.Right, MotorDir.Forward, speed)
    }

    /**
     * ถอยหลังทั้งสองล้อ
     * @param speed ความเร็ว 0-100 เปอร์เซ็นต์
     */
    //% blockId=l298_backward
    //% block="ถอยหลัง ความเร็ว %speed \\%"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=90
    //% group="ขับเคลื่อน"
    export function backward(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Backward, speed)
        runMotor(MotorSide.Right, MotorDir.Backward, speed)
    }

    /**
     * เลี้ยวซ้ายแบบหมุนอยู่กับที่ (ล้อซ้ายถอย ล้อขวาเดินหน้า)
     * @param speed ความเร็ว 0-100 เปอร์เซ็นต์
     */
    //% blockId=l298_turn_left
    //% block="เลี้ยวซ้าย ความเร็ว %speed \\%"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=85
    //% group="ขับเคลื่อน"
    export function turnLeft(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Backward, speed)
        runMotor(MotorSide.Right, MotorDir.Forward, speed)
    }

    /**
     * เลี้ยวขวาแบบหมุนอยู่กับที่ (ล้อซ้ายเดินหน้า ล้อขวาถอย)
     * @param speed ความเร็ว 0-100 เปอร์เซ็นต์
     */
    //% blockId=l298_turn_right
    //% block="เลี้ยวขวา ความเร็ว %speed \\%"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=80
    //% group="ขับเคลื่อน"
    export function turnRight(speed: number): void {
        runMotor(MotorSide.Left, MotorDir.Forward, speed)
        runMotor(MotorSide.Right, MotorDir.Backward, speed)
    }

    /**
     * หยุดมอเตอร์ทั้งสองข้าง (ปล่อยให้ไหลอิสระ)
     */
    //% blockId=l298_stop
    //% block="หยุดมอเตอร์"
    //% weight=75 blockGap=24
    //% group="ขับเคลื่อน"
    export function stop(): void {
        coast(pinIN1, pinIN2)
        coast(pinIN3, pinIN4)
    }

    /**
     * เดินหน้าตามเวลาที่กำหนด แล้วหยุดเอง
     * @param speed ความเร็ว 0-100 เปอร์เซ็นต์
     * @param ms เวลาเป็นมิลลิวินาที
     */
    //% blockId=l298_forward_for
    //% block="เดินหน้า ความเร็ว %speed \\% เป็นเวลา %ms ms"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% ms.shadow=timePicker ms.defl=1000
    //% weight=70
    //% group="ขับเคลื่อน"
    export function forwardFor(speed: number, ms: number): void {
        forward(speed)
        basic.pause(ms)
        stop()
    }

    /**
     * ขับสองล้อพร้อมกัน กำหนดความเร็วแยกกันได้
     * ค่าบวก = เดินหน้า, ค่าลบ = ถอยหลัง, 0 = หยุดล้อนั้น
     * @param left ความเร็วล้อซ้าย -100 ถึง 100
     * @param right ความเร็วล้อขวา -100 ถึง 100
     */
    //% blockId=l298_tank
    //% block="ขับ ล้อซ้าย %left \\% ล้อขวา %right \\%"
    //% left.min=-100 left.max=100 left.defl=60
    //% right.min=-100 right.max=100 right.defl=60
    //% inlineInputMode=inline
    //% weight=65 blockGap=24
    //% group="ขับเคลื่อน"
    export function tank(left: number, right: number): void {
        wheel(MotorSide.Left, left)
        wheel(MotorSide.Right, right)
    }

    // ---------- กลุ่ม: ขั้นสูง ----------

    /**
     * ขับล้อเดียว ค่าบวก = เดินหน้า, ค่าลบ = ถอยหลัง, 0 = หยุด
     * @param side เลือกล้อ
     * @param speed ความเร็ว -100 ถึง 100
     */
    //% blockId=l298_wheel
    //% block="ขับ %side ความเร็ว %speed \\%"
    //% speed.min=-100 speed.max=100 speed.defl=60
    //% weight=62
    //% group="ขั้นสูง"
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
     * ตั้งกำลังขั้นต่ำที่มอเตอร์เริ่มออกตัวได้ (0 = ปิดการชดเชย)
     * ถ้าสั่งความเร็ว 10 แล้วรถไม่ขยับ ให้ลองตั้งค่านี้ที่ 35-45
     * @param percent กำลังขั้นต่ำ 0-80 เปอร์เซ็นต์
     */
    //% blockId=l298_set_min_power
    //% block="ตั้งกำลังขั้นต่ำ %percent \\%"
    //% percent.min=0 percent.max=80 percent.defl=35
    //% weight=48
    //% group="ขั้นสูง"
    export function setMinPower(percent: number): void {
        minPower = Math.constrain(percent, 0, 80)
    }

    /**
     * สั่งมอเตอร์ทีละล้อ
     * @param side เลือกล้อ
     * @param dir ทิศทาง
     * @param speed ความเร็ว 0-100 เปอร์เซ็นต์
     */
    //% blockId=l298_run_motor
    //% block="หมุน %side %dir ความเร็ว %speed \\%"
    //% speed.min=0 speed.max=100 speed.defl=60
    //% weight=60
    //% group="ขั้นสูง"
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
     * หยุดมอเตอร์ทีละล้อ
     * @param side เลือกล้อ
     */
    //% blockId=l298_stop_side
    //% block="หยุด %side"
    //% weight=55
    //% group="ขั้นสูง"
    export function stopSide(side: MotorSide): void {
        if (side == MotorSide.Left) {
            coast(pinIN1, pinIN2)
        } else {
            coast(pinIN3, pinIN4)
        }
    }

    /**
     * เบรกมอเตอร์ทั้งสองข้าง (ดึงขา IN ทั้งคู่ขึ้น HIGH)
     * หยุดเร็วกว่าบล็อก "หยุดมอเตอร์" แต่กระชากกว่า
     */
    //% blockId=l298_brake
    //% block="เบรกมอเตอร์"
    //% weight=50
    //% group="ขั้นสูง"
    export function brake(): void {
        pins.digitalWritePin(pinIN1, 1)
        pins.digitalWritePin(pinIN2, 1)
        pins.digitalWritePin(pinIN3, 1)
        pins.digitalWritePin(pinIN4, 1)
    }

    /**
     * ตั้งความถี่ PWM ค่าเริ่มต้นคือ 1000 Hz
     * L298 เป็น BJT bridge ไม่ควรเกิน 2000 Hz
     * @param hz ความถี่เป็น Hz
     */
    //% blockId=l298_set_frequency
    //% block="ตั้งความถี่ PWM %hz Hz"
    //% hz.min=100 hz.max=2000 hz.defl=1000
    //% weight=45
    //% group="ขั้นสูง"
    export function setFrequency(hz: number): void {
        pwmPeriodUs = Math.round(1000000 / Math.constrain(hz, 100, 2000))
    }
}
