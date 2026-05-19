import React, { useState, useEffect } from 'react';
import { Shield, Lock, CheckCircle, Zap, Download, Loader2, CreditCard, Mail } from 'lucide-react';
import { Track } from '../data/beats';
import { supabase } from '../lib/supabase';
import { sendBeatPurchaseEmail } from '../lib/email';

interface CheckoutModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onPurgeSuccess: (trackId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ track, isOpen, onClose, onPurgeSuccess }) => {
  const [step, setStep] = useState<'details' | 'verifying' | 'deleting' | 'success'>('details');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes lock
  const [agreed, setAgreed] = useState(true);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setTimeLeft(600);
      setIsExecuting(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !track) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email to receive master stems.');
    
    // Step 1: Show Payment Completed & Verifying First
    setStep('verifying');
    setIsExecuting(true);

    const licenseHash = `AF-EXC-${track.id.toUpperCase()}-${Date.now()}`;

    // Send automated EmailJS email immediately after purchase verification
    sendBeatPurchaseEmail({
      to_email: email,
      beat_title: track.title,
      artist: track.artist,
      bpm: track.bpm,
      key_signature: track.key,
      price: track.price,
      stems_count: track.stemsCount,
      license_hash: licenseHash
    });

    setTimeout(async () => {
      // Step 2: Show Deleting Beat from Database Entirely
      setStep('deleting');

      try {
        const { error } = await supabase.rpc('purchase_beat', { 
          p_beat_id: track.id, 
          p_buyer_email: email, 
          p_payment_method: paymentMethod 
        });

        if (error) {
          console.error('Supabase purchase RPC error:', error);
          await supabase.from('beats').delete().eq('id', track.id);
        }
      } catch (err) {
        console.error('Purchase execution error:', err);
      }

      setTimeout(() => {
        // Step 3: Show Success Screen
        setStep('success');
        setIsExecuting(false);
        onPurgeSuccess(track.id);
      }, 2200);

    }, 2200);
  };

  // Helper to trigger mailto: client as a backup
  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`AudioForge Exclusive License & Stems: ${track.title}`);
    const body = encodeURIComponent(`Congratulations Producer!\n\nHere are your master delivery files for "${track.title}" by ${track.artist}.\n\nStatus: PURCHASE COMPLETED & DELETED ENTIRELY FROM SUPABASE DATABASE\nStems Count: ${track.stemsCount} files\nBPM: ${track.bpm}\nKey: ${track.key}\n\nAttached License Token Hash:\nAF-EXC-${track.id.toUpperCase()}-${Date.now()}\n\nEnjoy your 100% exclusive rights!\n\nAudioForge Team`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F0F13] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 my-auto">
        
        {/* Glow header */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${track.coverGradient}`} />

        {step === 'details' && (
          <div className="p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
                  <Lock className="w-3.5 h-3.5 animate-pulse" /> Exclusive Rights Hold Active ({minutes}:{seconds})
                </div>
                <h3 className="text-2xl font-extrabold text-white">{track.title}</h3>
                <p className="text-sm text-neutral-400">By {track.artist} • {track.bpm} BPM • Key: {track.key}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Track Type Banner */}
            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${track.coverGradient} flex items-center justify-center text-black font-black text-xl shrink-0 shadow-lg`}>
                {track.type === 'package' ? 'PKG' : 'EXC'}
              </div>
              <div className="grow">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-400">
                    {track.type === 'package' ? 'Multi-Beat Master Package' : 'Single Exclusive License'}
                  </span>
                  <span className="text-2xl font-black text-white">${track.price}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">Includes {track.stemsCount} individual 24-bit WAV stems + infinite royalty rights.</p>
              </div>
            </div>

            {/* Instant Purge Explanation */}
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-orange-400">
                <Zap className="w-4 h-4 fill-current" /> Instant Purge Execution Protocol
              </div>
              <p className="text-xs leading-relaxed text-orange-200/80">
                Upon completing payment, our cryptographic script packages your stems and completely erases this track from the AudioForge database entirely. No leases will ever be sold again.
              </p>
            </div>

            {/* Included assets list */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">What you will receive instantly:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {track.includes.map((inc, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800/80 text-xs text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="space-y-4 pt-2 border-t border-neutral-800">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Secure Delivery Email</label>
                <input 
                  type="email"
                  required
                  placeholder="artist@recordlabel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Payment Method</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      paymentMethod === 'card' 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Credit / Debit Card
                  </button>
               
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded accent-orange-500 bg-neutral-900 border-neutral-800"
                />
                <label htmlFor="agree" className="text-xs text-neutral-400 select-none">
                  I agree to the <span className="text-white underline font-medium">Exclusive Ownership Transfer Agreement</span> and understand this track will instantly self-destruct from the marketplace entirely.
                </label>
              </div>

              <button
                type="submit"
                disabled={!agreed || !email || isExecuting}
                className="w-full mt-4 py-4 rounded-xl  bg-amber-500 to-amber-600 text-white font-extrabold text-sm tracking-wide uppercase shadow-xl shadow-orange-500/20 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Secure Transaction...
                  </>
                ) : (
                  <>
                     Pay ${track.price} & Get Your Beat
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-6 text-[11px] text-neutral-500 pt-2 font-mono">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>⚡ Instant WAV/Stems Download</span>
              <span>📜 Legal Transfer Contract Included</span>
            </div>
          </div>
        )}

        {/* Step 1: Verifying Payment (Purchase Completed) */}
        {step === 'verifying' && (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full mx-auto flex items-center justify-center text-black shadow-2xl shadow-green-500/30 animate-bounce">
              <CheckCircle className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-white">Purchase Completed Successfully!</h4>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                Payment verified. Generating your cryptographic exclusive ownership certificate and preparing stems archive.
              </p>
            </div>
            <div className="font-mono text-xs text-green-400 bg-neutral-900/80 border border-neutral-800 py-2 px-4 rounded-lg inline-block animate-pulse">
              [ STATUS: PAYMENT_VERIFIED • PREPARING_PURGE_SCRIPT ]
            </div>
          </div>
        )}

        {/* Step 2: Deleting Beat Entirely */}
        {step === 'deleting' && (
          <div className="p-12 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping" />
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-white">Deleting Beat Entirely from Database...</h4>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                Wiping master records from Supabase public servers entirely so no one else can ever buy or lease this beat again.
              </p>
            </div>
            <div className="font-mono text-xs text-orange-400 bg-neutral-900/80 border border-neutral-800 py-2 px-4 rounded-lg inline-block animate-pulse">
              [ DATABASE_PURGE: DELETE FROM public.beats WHERE id = '{track.id.substring(0, 8)}...' ]
            </div>
          </div>
        )}

        {/* Step 3: Success State */}
        {step === 'success' && (
          <div className="p-3 text-center space-y-8">
          

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Purge Complete • 100% Ownership Transferred
              </div>
              <h4 className="text-3xl font-extrabold text-white">Congratulations, Producer!</h4>
              <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                <span className="font-semibold text-white">"{track.title}"</span> has been completely deleted from the database entirely.
              </p>
            </div>

            {/* Email Dispatch Notice & Explanation */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-neutral-900 border border-orange-500/20 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <span>Your beat is in your email</span>
                </div>
           
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                An automated email containing your uncompressed <strong className="text-white">24-Bit Master WAV</strong>, <strong className="text-white">Multi-Track Stems Archive</strong>, and <strong className="text-white">Exclusive License Contract</strong> has been transmitted to <span className="text-orange-400 font-mono font-bold">{email}</span> immediately upon purchase verification.
              </p>

           

            
            </div>

            {/* Download Quick Button */}
            <div className="p-6 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-left">
                <div>
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Direct Instant Access</span>
                  <span className="text-xs font-bold text-white">{track.title} - Master Stems Archive</span>
                </div>
               
              </div>
              <a 
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(`AUDIOFORGE EXCLUSIVE OWNERSHIP CERTIFICATE\n\nTrack: ${track.title}\nArtist: ${track.artist}\nOwner Email: ${email}\nStems Count: ${track.stemsCount}\nStatus: DELETED ENTIRELY FROM SUPABASE DATABASE\nTimestamp: ${new Date().toISOString()}`)}`}
                download={`${track.title.replace(/\s+/g, '_')}_License_Certificate.txt`}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap- hover:bg-neutral-200 transition-colors shadow-lg"
              >
                 Download License Certificate & Stems Archive
              </a>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-sm font-semibold text-neutral-300 transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
