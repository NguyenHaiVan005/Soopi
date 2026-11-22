import React, { useState } from 'react';
import { Copy, Check, QrCode, Building2, User, CreditCard, FileText } from 'lucide-react';
import { formatVND } from '../utils/format';

export default function BankTransferQR({ orderCode, amount, compact = false }) {
  const [copiedField, setCopiedField] = useState(null);

  const bankInfo = {
    bankName: 'VietinBank',
    bankFullName: 'Ngân hàng TMCP Công Thương Việt Nam',
    branch: 'CN Lưu Xá - PGD Đồng Tiến',
    accountNumber: '103876948649',
    accountHolder: 'NGUYEN HAI VAN',
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-cyan-50/60 border border-blue-200/80 rounded-2xl ${compact ? 'p-3.5' : 'p-5'} text-left shadow-sm`}>
      <div className="flex items-center justify-between pb-3 border-b border-blue-200/60 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Thanh Toán Chuyển Khoản VietQR
            </h4>
            <p className="text-[11px] text-blue-700 font-medium">
              Quét mã 24/7 từ mọi ứng dụng Ngân hàng & Ví điện tử
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
          Napas 247
        </span>
      </div>

      <div className={`grid ${compact ? 'grid-cols-1 sm:grid-cols-12' : 'grid-cols-1 md:grid-cols-12'} gap-4 items-center`}>
        {/* QR Code Image Preview */}
        <div className={`${compact ? 'sm:col-span-5' : 'md:col-span-5'} flex flex-col items-center justify-center`}>
          <div className="relative group bg-white p-2 rounded-2xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all max-w-[210px]">
            <img
              src="/vietinbank-qr.jpg"
              alt="Mã VietQR VietinBank - NGUYEN HAI VAN"
              className="w-full h-auto rounded-xl object-contain block mx-auto"
            />
            <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
              <span className="text-[10px] bg-white/90 text-blue-900 font-bold px-2 py-1 rounded-full shadow-sm">
                Quét mã để thanh toán
              </span>
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-2 text-center">
            Mở app ngân hàng & bấm <b>Quét QR</b>
          </span>
        </div>

        {/* Bank Account Info & Copy Buttons */}
        <div className={`${compact ? 'sm:col-span-7' : 'md:col-span-7'} space-y-2`}>
          {/* Bank */}
          <div className="bg-white/80 rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block">Ngân hàng</span>
                <span className="text-xs font-bold text-gray-900">
                  {bankInfo.bankName} <span className="text-[10px] font-normal text-gray-500">({bankInfo.branch})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-white rounded-xl p-2.5 border border-blue-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block">Số tài khoản</span>
                <span className="text-sm font-black font-mono tracking-wider text-blue-950">
                  {bankInfo.accountNumber}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(bankInfo.accountNumber, 'accNumber')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedField === 'accNumber' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Account Holder */}
          <div className="bg-white/80 rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 block">Chủ tài khoản</span>
                <span className="text-xs font-black text-gray-900 uppercase">
                  {bankInfo.accountHolder}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(bankInfo.accountHolder, 'accHolder')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedField === 'accHolder' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          {/* Amount (if provided) */}
          {amount > 0 && (
            <div className="bg-white/80 rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block">Số tiền cần chuyển</span>
                <span className="text-sm font-black text-soopi-600">
                  {formatVND(amount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(String(amount), 'amount')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-50 hover:bg-orange-100 text-soopi-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedField === 'amount' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Order Code / Transfer Content (if provided) */}
          {orderCode && (
            <div className="bg-white/80 rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 block">Nội dung chuyển khoản</span>
                  <span className="text-xs font-black font-mono text-gray-900">
                    {orderCode}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(orderCode, 'orderCode')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedField === 'orderCode' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 mt-3 pt-2.5 border-t border-blue-200/60 text-center">
        💡 <i>Sau khi chuyển khoản, hệ thống sẽ xác nhận đơn và xử lý giao hàng ngay cho bạn.</i>
      </p>
    </div>
  );
}

