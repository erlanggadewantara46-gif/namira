import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MilestoneChallenge, User } from '../types';
import { X, CheckCircle2, Ticket, Calendar, Sparkles, MapPin, Gift, Heart } from 'lucide-react';

interface VoucherModalProps {
  milestone: MilestoneChallenge | null;
  onClose: () => void;
  currentUser: User | null;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ milestone, onClose, currentUser }) => {
  if (!milestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl shadow-2xl border border-rose-200/80 overflow-hidden text-slate-800 my-auto max-h-[85vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Top Decorative Header */}
          <div className="relative h-36 sm:h-44 shrink-0 overflow-hidden bg-rose-900">
            <img
              src={milestone.image}
              alt={milestone.title}
              className="w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950 via-rose-950/40 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors backdrop-blur-sm cursor-pointer border border-white/20 shadow-md"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6 flex items-end justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white shadow-sm backdrop-blur-md mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Hari Ke-{milestone.day} Milestone
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-md leading-tight">
                  {milestone.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Ticket Body Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {/* Ticket Badge Info */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-100/60 border border-rose-200/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-sm">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                    Kode Voucher Spesial
                  </div>
                  <div className="text-sm font-mono font-bold text-rose-950">
                    {milestone.voucherCode}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  milestone.isCompleted 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {milestone.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TERKLAIM
                    </>
                  ) : (
                    <>
                      <Gift className="w-3.5 h-3.5 text-amber-600" /> SIAP DITUKAR
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Reward & Details */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-600" /> Hadiah Yang Didapatkan
                </h4>
                <p className="text-base font-semibold text-slate-900 bg-white p-3.5 rounded-xl border border-rose-100 shadow-sm">
                  {milestone.reward}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" /> Cara Penukaran & Detail
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/80">
                  {milestone.rewardDetails}
                </p>
              </div>
            </div>

            {/* Dotted separator line */}
            <div className="relative my-2">
              <div className="border-b-2 border-dashed border-rose-200" />
              <div className="absolute -left-8 -top-3 w-6 h-6 bg-slate-800 rounded-full" />
              <div className="absolute -right-8 -top-3 w-6 h-6 bg-slate-800 rounded-full" />
            </div>

            {/* Bottom Footer Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {milestone.completedAt ? (
                    <>
                      Diklaim pada:{' '}
                      <span className="font-bold text-emerald-700">
                        {new Date(milestone.completedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        , {new Date(milestone.completedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB
                      </span>
                    </>
                  ) : (
                    'Masa Berlaku: Kapanpun Untuk Namira ❤️'
                  )}
                </span>
              </div>
              <div className="font-medium text-rose-700 shrink-0">
                Spesial Ulang Tahun Namira ✨
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              Tutup Voucher
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
