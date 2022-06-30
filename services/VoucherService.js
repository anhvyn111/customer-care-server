const Voucher = require("../mongoose-entities/Voucher");
const CustomerVoucher = require("../mongoose-entities/CustomerVoucher");
const mongoose = require("mongoose");
const createVoucher = async (voucher) => {
    var newVoucher = new Voucher({
        voucherName: voucher.voucherName,
        voucherCode: voucher.voucherCode,
        duration: voucher.duration
    });
    await newVoucher.save( async(err, data) => {
        if (err){
            newVoucher = null;
        }            
        newVoucher = data;
    });
    return newVoucher;
}

const updateVoucher = async (voucher) => {
    var updatedVoucher = await voucher.findByIdAndUpdate(voucher._id, 
        {
            voucherName: voucher.voucherName,
            voucherCode: voucher.voucherCode,
            duration: voucher.duration
        });
    return updatedVoucher;
}

const deleteVoucher = async (id) => {
    await CustomerVoucher.findOneAndDelete({customerId: id});
    await Voucher.findByIdAndDelete(id);
}

const getAllVouchers = async () => {
    var vouchers = await Voucher.find();
    return vouchers;
}

const getVoucherById = async (id) => {
    var voucher = await Voucher.findById(id);
    console.log("Voucher", voucher);
    return voucher;
}
const getVoucherByCode = async (voucherCode) => {
    var voucher = await Voucher.findOne({ voucherCode: voucherCode});
    return voucher;
}

const isVoucherExisted = async (voucher) => {
    var voucher = await getVoucherByCode(voucher.voucherCode);
    if (voucher != null){
        return true;
    }
    return false;
}



const createCustomerVoucher = async (customerVoucher) => {
    var newCustomerVoucher = new CustomerVoucher({
        voucherId: customerVoucher.voucherId,
        customerId: customerVoucher.customerId,
        dueDate: customerVoucher.dueDate
    });
    await newCustomerVoucher.save();
    return newCustomerVoucher;
}

const deleteCustomerVoucher = async(id) => {
    await CustomerVoucher.findByIdAndDelete(id);
}

const getAllCustomerVouchers = async (id) => {
    var customerVouchers = await CustomerVoucher.aggregate([
        {
          $lookup: {
            from: "vouchers",
            localField: "voucherId",
            foreignField: "_id",
            as: "voucher",
          }
        },
        { $unwind: "$voucher" },
        {
            $lookup: {
              from: "users",
              localField: "customerId",
              foreignField: "_id",
              as: "customer",
            },
        },
        { $unwind: "$customer" },      
        {   
            $project:{
                _id : 1,
                dueDate: 1,
                appointmentType : "$voucher",
                customer : "$customer",
                createdAt: 1
            } 
        },
        { $sort: { customer: 1} }
    ]);
    return customerVouchers;
}

const getCustomerVouchersByCustomerId = async (customerId) => {
    var customerVouchers = await getAllCustomerVouchers();
    customerVouchers = customerVouchers.filter(c => c.customer._id == customerId);
    console.log(customerVouchers);
    return customerVouchers;
}

const getCustomerVoucherById = async (id) => {
    var customerVoucher = await CustomerVoucher.aggregate([
        {
          $lookup: {
            from: "vouchers",
            localField: "voucherId",
            foreignField: "_id",
            as: "voucher",
          }
        },
        { $unwind: "$voucher" },
        {
            $lookup: {
              from: "users",
              localField: "customerId",
              foreignField: "_id",
              as: "customer",
            },
        },
        { $unwind: "$customer" },      
        {   
            $project:{
                _id : 1,
                dueDate: 1,
                voucher : "$voucher",
                customer : "$customer",
                createdAt: 1
            } 
        },
        { $match: { _id: mongoose.Types.ObjectId(id) } }
    ]);
    console.log("customerVoucher",customerVoucher);
    return customerVoucher[0];
}

const isCustomerVoucherExisted = async (voucherId, customerId) => {
    var customerVoucher = await CustomerVoucher.findOne({ voucherId: voucherId, customerId: customerId });
    console.log(customerVoucher);
    if(customerVoucher != null){
        return true;
    }
    return false;
}


module.exports = {
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getAllVouchers,
    getVoucherById,
    getVoucherByCode,
    isVoucherExisted,
    createCustomerVoucher,
    deleteCustomerVoucher,
    getAllCustomerVouchers,
    getCustomerVouchersByCustomerId,
    getCustomerVoucherById,
    isCustomerVoucherExisted
}
