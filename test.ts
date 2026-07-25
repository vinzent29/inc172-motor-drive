// ไฟล์ทดสอบ - ไม่ถูกรวมเข้าไปตอนเด็ก ๆ เอา extension ไปใช้
l298.setup(DigitalPin.P13, DigitalPin.P14, DigitalPin.P15, DigitalPin.P16)
l298.setMinPower(35)

input.onButtonPressed(Button.A, function () {
    // เลี้ยวโค้งซ้าย: ล้อซ้ายช้ากว่าล้อขวา
    l298.tank(20, 70)
    basic.pause(1000)
    l298.tank(0, 0)
})

input.onButtonPressed(Button.B, function () {
    // หมุนอยู่กับที่: ล้อสองข้างสวนทางกัน
    l298.tank(-60, 60)
    basic.pause(500)
    l298.tank(0, 0)
})

input.onGesture(Gesture.Shake, function () {
    l298.brake()
    basic.showIcon(IconNames.No)
})
