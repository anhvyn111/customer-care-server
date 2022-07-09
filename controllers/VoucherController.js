const router = require("express").Router();
const auth = require("../middlewares/auth");
const Voucher = require("../mongoose-entities/Voucher");
const userRole = require("../models/Role");
const CustomerVoucher = require("../mongoose-entities/CustomerVoucher");
const _voucherService = require("../services/VoucherService");

router.get('/', auth.isStaff, async (req, res) => {
    try{
        var vouchers = await _voucherService.getAllVouchers();
        return res.status(200).json(vouchers);
    }
    catch (err) {
        return res.status(500).json(err);
    }
})

router.get('/:id', auth.isStaff, async (req, res) => {
        var id = req.params.id;
        var voucher = await _voucherService.getVoucherById(id);
        if(!voucher){
            return res.status(400);
        }
        return res.status(200).json(voucher);
})

router.post('/', auth.isStaff, async (req, res) => {
    try {
        var voucherName = req.body.voucherName;
        var voucherCode = req.body.voucherCode;
        var duration = req.body.duration;
        if (voucherName == null || voucherCode == null || duration == null){
            return res.status(400);
        }
        var newVoucher = {voucherName, voucherCode, duration};
        var isVoucherExisted = await _voucherService.isVoucherExisted(newVoucher);
        if (isVoucherExisted){
            return res.status(400).json({ errorMsg: "Voucher code is already existed."});
        }
        newVoucher = await _voucherService.createVoucher(newVoucher);
        if (newVoucher == null){
            return res.status(500).json("Can not create new voucher.");
        }
        return res.status(200).json(newVoucher);
    }
    catch(err) {
        res.status(500).json('err');
    }
})



router.put('/:id', auth.isStaff, async (req, res) => {
    var id = req.params.id;
    if (req.role == userRole.Staff && req.user.id != id){
        return res.status(403).json("You do not have permission");
    }
    var updateStaff = {
        name: req.body.name,
        phonerNumber: req.body.phonerNumber,
        birth: req.body.birth,
        gender: req.body.gender
    }

    var updateStaff = await userService
})

router.delete('/:id', auth.isStaff, async (req, res) => {
    var id = req.params.id;
    
})

module.exports = router; 