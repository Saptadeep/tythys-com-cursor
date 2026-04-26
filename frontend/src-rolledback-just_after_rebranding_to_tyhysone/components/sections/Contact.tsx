'use client'
// src/components/sections/Contact.tsx
import { useRef, useState }  from 'react'
import { motion, useInView } from 'motion/react'
import { Send, CheckCircle, AlertCircle, Clock, MapPin, Zap } from 'lucide-react'
import { SERVICES }          from '@/config/services'
import { cn }                from '@/lib/cn'
import type { AppState }     from '@/types'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

const STATE_STYLES: Record<FormState, string> = {
  idle:    'border-accent/40 text-accent hover:bg-accent hover:text-bg',
  sending: 'border-gold/40  text-gold  cursor-not-allowed opacity-80',
  sent:    'border-ok/40    text-ok    cursor-default',
  error:   'border-danger/40 text-danger',
}

const INTEREST_OPTIONS = [
  'Select a product or service',
  ...SERVICES.map(s => `${s.name} — ${s.category}`),
  'General Enquiry',
]

export function Contact() {
  const ref      = useRef<HTMLDivElement>(null)
  const inView   = useInView(ref, { once: true, margin: '-80px' })
  const [state, setState] = useState<FormState>('idle')
  const [form,  setForm]  = useState({
    firstName: '', lastName: '', email: '', interest: '', message: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'sending' || state === 'sent') return
    setState('sending')
    // Simulate API call — replace with your actual Formspree or API endpoint
    await new Promise(r => setTimeout(r, 1400))
    setState('sent')
  }

  return (
    <section id="contact" className="relative z-10">
      <div ref={ref} className="mx-auto max-w-[1300px] px-4 py-14 sm:px-7 sm:py-20 md:px-10 lg:px-16 lg:py-24 xl:px-20">

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-20">

          {/* Left info */}
          <div>
            <motion.span
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              className="eyebrow mb-3"
            >
              Contact
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05, duration: 0.6 }}
              className="section-title mb-4"
            >
              Interested or<br />
              <em className="title-accent">just curious?</em>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="section-body mb-8 max-w-full"
            >
              If one of these tools could help you, or if you have a problem worth
              building for — send a message. No sales pitch, no commitment.
            </motion.p>

            {/* Details */}
            {[
              { icon: Clock,  label: 'Response time', value: 'Within 48 hours'           },
              { icon: Zap,    label: 'Stage',          value: 'Early — building in public' },
              { icon: MapPin, label: 'Domain',         value: 'tythys.com'                },
            ].map(({ icon: Icon, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                className="mb-4"
              >
                <div className="mb-0.5 flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-dim">
                  <Icon size={10} />
                  {label}
                </div>
                <div className="text-[0.92rem] font-medium text-accent">{value}</div>
              </motion.div>
            ))}
          </div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="rounded-2xl border border-accent-dim p-6 md:p-8"
            style={{ background: 'rgba(10,20,42,0.6)', backdropFilter: 'blur(20px)' }}
          >
            {state === 'sent' ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                <CheckCircle size={40} className="text-ok" />
                <h3 className="font-display text-xl font-light text-[#dde4f0]">Message sent</h3>
                <p className="text-sm text-dim">I&apos;ll get back to you within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

                {/* Name row */}
                <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
                  {(['firstName', 'lastName'] as const).map((field, i) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">
                        {i === 0 ? 'First name' : 'Last name'}
                      </label>
                      <input
                        type="text" name={field}
                        value={form[field]} onChange={handleChange}
                        placeholder={i === 0 ? 'Alex' : 'Morgan'}
                        required={i === 0}
                        className="field-input"
                      />
                    </div>
                  ))}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Email</label>
                  <input
                    type="email" name="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@company.com" required
                    className="field-input"
                  />
                </div>

                {/* Interest */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">I&apos;m interested in…</label>
                  <select
                    name="interest" value={form.interest} onChange={handleChange}
                    className="field-input appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a8a9e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                  >
                    {INTEREST_OPTIONS.map(o => (
                      <option key={o} value={o === INTEREST_OPTIONS[0] ? '' : o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">
                    Tell me about your problem
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    placeholder="What are you trying to compute or solve?"
                    className="field-input min-h-[108px] resize-y"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className={cn(
                    'mt-1 inline-flex min-h-[48px] items-center justify-center gap-2.5 self-start',
                    'rounded-lg border px-6 py-3 text-sm font-medium',
                    'transition-all duration-200',
                    STATE_STYLES[state],
                  )}
                >
                  {state === 'sending' ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message <Send size={14} />
                    </>
                  )}
                </button>

                {state === 'error' && (
                  <p className="flex items-center gap-2 text-sm text-danger">
                    <AlertCircle size={14} />
                    Something went wrong. Please try again.
                  </p>
                )}

              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
