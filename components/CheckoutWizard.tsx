'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { formatPrice } from '@/lib/utils'

interface PackageData {
  id: string
  title: string
  location: string
  durationDays: number
  priceShared: number
  pricePrivate: number
  featuredImage: string | null
}

interface CheckoutWizardProps {
  pkg: PackageData
  initialGuests: number
  initialRoomType: 'shared' | 'private'
}

export default function CheckoutWizard({ pkg, initialGuests, initialRoomType }: CheckoutWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Step 1: Details state
  const [guests, setGuests] = useState(initialGuests)
  const [roomType, setRoomType] = useState<'shared' | 'private'>(initialRoomType)
  const [arrivalDate, setArrivalDate] = useState(() => {
    // Default to a date 30 days from now
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  // Step 2: Traveler Info state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('US')
  const [passportNumber, setPassportNumber] = useState('')
  const [dietaryReqs, setDietaryReqs] = useState('')
  const [medicalInfo, setMedicalInfo] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // Step 3: Payment state
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'paypal'>('razorpay')

  // Calculate pricing
  const basePrice = roomType === 'shared' ? pkg.priceShared : pkg.pricePrivate
  const subtotal = basePrice * guests
  const discount = promoDiscount
  const total = subtotal - discount

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'PEACE10') {
      setPromoDiscount(subtotal * 0.1) // 10% off
    } else {
      setErrorMsg('Invalid Promo Code')
      setTimeout(() => setErrorMsg(''), 3000)
    }
  }

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const resScript = await loadRazorpayScript()
      if (!resScript) {
        throw new Error('Razorpay SDK failed to load. Are you offline?')
      }

      // 1. Create pending booking & order
      const createRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          guestsCount: guests,
          roomType,
          arrivalDate,
          fullName: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          country,
          passportNumber,
          dietaryReqs,
          medicalInfo,
          specialRequests,
          paymentMethod: 'razorpay'
        })
      })

      const bookingData = await createRes.json()
      if (!createRes.ok || bookingData.error) {
        throw new Error(bookingData.error || 'Failed to initialize booking')
      }

      const { gatewayData, bookingRef } = bookingData

      // 2. Open Razorpay checkout modal
      const options = {
        key: gatewayData.key,
        amount: gatewayData.amount,
        currency: gatewayData.currency,
        name: 'India Yoga Tourism',
        description: `Booking ref: ${bookingRef}`,
        order_id: gatewayData.orderId,
        handler: async function (response: any) {
          setLoading(true)
          // 3. Verify Signature
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            })

            const verifyData = await verifyRes.json()
            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || 'Signature verification failed')
            }

            // Redirect to success page
            router.push(`/booking/confirmation?ref=${bookingRef}`)
          } catch (err: any) {
            setErrorMsg(err.message || 'Payment verification failed')
            setLoading(false)
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone
        },
        theme: {
          color: '#012d1d' // Primary brand color
        }
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
      setLoading(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during booking creation')
      setLoading(false)
    }
  }

  // PayPal helpers
  const handlePaypalCreateOrder = async () => {
    setErrorMsg('')
    try {
      const createRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          guestsCount: guests,
          roomType,
          arrivalDate,
          fullName: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          country,
          passportNumber,
          dietaryReqs,
          medicalInfo,
          specialRequests,
          paymentMethod: 'paypal'
        })
      })

      const bookingData = await createRes.json()
      if (!createRes.ok || bookingData.error) {
        throw new Error(bookingData.error || 'Failed to initialize booking')
      }

      return bookingData.gatewayData.orderId
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create PayPal order')
      return ''
    }
  }

  const handlePaypalApprove = async (data: any) => {
    setLoading(true)
    try {
      const captureRes = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID
        })
      })

      const captureData = await captureRes.json()
      if (!captureRes.ok || captureData.error) {
        throw new Error(captureData.error || 'Payment capture failed')
      }

      router.push(`/booking/confirmation?ref=${captureData.bookingRef}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to capture PayPal payment')
      setLoading(false)
    }
  }

  // Quick navigation
  const nextStep = (targetStep: number) => {
    // Simple validation
    if (targetStep === 2) {
      // Step 1 validation
      if (!arrivalDate) {
        setErrorMsg('Please select your arrival date')
        return
      }
    }
    if (targetStep === 3) {
      // Step 2 validation
      if (!firstName || !lastName || !email || !phone || !passportNumber) {
        setErrorMsg('Please fill in all required traveler information fields (*)')
        return
      }
    }
    setErrorMsg('')
    setStep(targetStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left Sidebar: Order Summary */}
      <aside className="lg:col-span-4 order-2 lg:order-1 sticky top-32">
        <div className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-surface-container-highest">
          <div className="h-48 w-full relative bg-surface-variant">
            <img
              className="w-full h-full object-cover"
              alt={pkg.title}
              src={pkg.featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_gtnVV3Wn_FuL2esWAtg7zvGMoZsSCclpuQGldYwgj7ksmyY_DtKrzyWrmAop1KUBU-oL0NKy9R-ullj7xI7mvWco_F3po1fyGnePLl1EgKRj7pzUiKP8rAlAEzQSdVrjpcnC26tXsbyWIQjppLjYx_JU31gy6oEBIwozcQFZjU6q3n0G9ck9Oz76KlAmzbBkLjQTYA2ENWNuW3jRZDLeHEb-L3BJ-IKdMfbE3wl4OL9Nwc59eiHjbkIMQuvTVkQaOLsv9F_bhzSV'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
          </div>
          <div className="p-8">
            <span className="inline-block px-3 py-1 bg-secondary-container/30 text-secondary rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              {pkg.durationDays} Days
            </span>
            <h2 className="font-headline-md text-primary mb-2">{pkg.title}</h2>
            <p className="text-on-surface-variant text-sm mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {pkg.location}
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Arrival Date</span>
                <span className="font-bold text-on-surface">{arrivalDate ? new Date(arrivalDate).toLocaleDateString() : 'Not chosen'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Guests</span>
                <span className="font-bold text-on-surface">
                  {guests} {guests === 1 ? 'Adult' : 'Adults'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Room Accommodation</span>
                <span className="font-bold text-on-surface capitalize">
                  {roomType} Room
                </span>
              </div>
            </div>
            <hr className="border-surface-container-highest mb-6" />
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Base Retreat Package</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            <hr className="border-surface-container-highest mb-6" />
            <div className="flex justify-between items-end">
              <span className="font-headline-md text-primary">Total Amount</span>
              <span className="font-label-price text-tertiary-fixed-dim text-[28px]">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content: Checkout Flow */}
      <section className="lg:col-span-8 order-1 lg:order-2">
        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-surface-container-highest -z-10"></div>
          <div className="flex justify-between items-center relative z-0">
            {/* Step 1 Indicator */}
            <div className="flex flex-col items-center gap-2 bg-surface px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 1
                    ? 'bg-primary text-on-primary shadow-md'
                    : step > 1
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-container-highest text-outline'
                }`}
              >
                {step > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : '1'}
              </div>
              <span className={`text-sm ${step === 1 ? 'font-bold text-primary' : 'text-outline'}`}>
                Details
              </span>
            </div>
            {/* Step 2 Indicator */}
            <div className="flex flex-col items-center gap-2 bg-surface px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 2
                    ? 'bg-primary text-on-primary shadow-md'
                    : step > 2
                    ? 'bg-primary/20 text-primary'
                    : 'bg-surface-container-highest text-outline'
                }`}
              >
                {step > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : '2'}
              </div>
              <span className={`text-sm ${step === 2 ? 'font-bold text-primary' : 'text-outline'}`}>
                Your Info
              </span>
            </div>
            {/* Step 3 Indicator */}
            <div className="flex flex-col items-center gap-2 bg-surface px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === 3
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-highest text-outline'
                }`}
              >
                '3'
              </div>
              <span className={`text-sm ${step === 3 ? 'font-bold text-primary' : 'text-outline'}`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg border border-error/20 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Details Section */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-headline-lg text-primary mb-8">Customize Your Journey</h1>
            <div className="space-y-10">
              {/* Date & Guests Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Arrival Date</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-0 top-2 text-outline-variant">
                      calendar_month
                    </span>
                    <input
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 pl-8 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                      type="date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Guests Count</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-0 top-2 text-outline-variant">
                      group
                    </span>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 pl-8 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Adult' : 'Adults'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Cards Option */}
              <div>
                <label className="block text-sm text-on-surface-variant mb-4">Accommodation Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setRoomType('shared')}
                    className={`p-5 border rounded-lg cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      roomType === 'shared'
                        ? 'border-tertiary-fixed-dim bg-surface-container-low shadow-sm'
                        : 'border-outline-variant/30 hover:border-outline-variant/80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-primary">Shared Twin Room</h3>
                        {roomType === 'shared' && (
                          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed-dim">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4">
                        Authentic living spaces designed to share with a fellow traveler.
                      </p>
                    </div>
                    <span className="font-label-price text-sm text-on-surface">Included</span>
                  </div>

                  <div
                    onClick={() => setRoomType('private')}
                    className={`p-5 border rounded-lg cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      roomType === 'private'
                        ? 'border-tertiary-fixed-dim bg-surface-container-low shadow-sm'
                        : 'border-outline-variant/30 hover:border-outline-variant/80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-primary">Private Suite</h3>
                        {roomType === 'private' && (
                          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed-dim">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4">
                        Single occupancy room with complete privacy and premium comforts.
                      </p>
                    </div>
                    <span className="font-label-price text-sm text-tertiary-fixed-dim">
                      +{formatPrice(pkg.pricePrivate - pkg.priceShared)} /person
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <label className="block text-sm text-on-surface-variant mb-2">Promo Code</label>
                <div className="flex gap-4">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-primary font-bold uppercase max-w-[200px] focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="Enter code (e.g. PEACE10)"
                    type="text"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="text-sm font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
                    type="button"
                  >
                    Apply Code
                  </button>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => nextStep(2)}
                  className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Continue to Details
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Traveler Info Section */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-headline-lg text-primary mb-8">Traveler Information</h1>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">First Name *</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="Jane"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Last Name *</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="Doe"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Email Address *</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="jane@example.com"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Contact Number *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Country *</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="United States"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Passport Number *</label>
                  <input
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors"
                    placeholder="Enter passport number"
                    type="text"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Dietary Requirements / Medical Notes</label>
                <textarea
                  value={dietaryReqs}
                  onChange={(e) => setDietaryReqs(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors resize-none"
                  placeholder="e.g., Vegan, Gluten-free, or specific health conditions we should be aware of."
                  rows={3}
                />
              </div>

              <div className="pt-8 flex justify-between items-center border-t border-surface-container-highest">
                <button
                  onClick={() => nextStep(1)}
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
                <button
                  onClick={() => nextStep(3)}
                  className="bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Continue to Payment
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment Section */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="font-headline-lg text-primary mb-8">Secure Payment</h1>
            <div className="space-y-8">
              {/* Payment Method Selectors */}
              <div className="space-y-4">
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary bg-surface-container'
                      : 'border-surface-container-highest hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-[28px]">credit_card</span>
                    <span className="font-bold text-primary">Razorpay (Card, UPI, Netbanking)</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center">
                    {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'paypal'
                      ? 'border-primary bg-surface-container'
                      : 'border-surface-container-highest hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-[28px]">payments</span>
                    <span className="font-bold text-primary">PayPal</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center">
                    {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                  </div>
                </div>
              </div>

              {/* Payment Gateway Actions */}
              <div className="pt-8 border-t border-surface-container-highest">
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={() => nextStep(2)}
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>

                  <div>
                    {paymentMethod === 'razorpay' ? (
                      <button
                        onClick={handleRazorpayPayment}
                        disabled={loading}
                        className="bg-tertiary-fixed-dim text-on-tertiary-fixed-variant px-8 py-4 rounded-lg font-label-price text-[18px] hover:opacity-90 transition-opacity flex items-center gap-3 ambient-shadow disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? 'Processing...' : `Pay ${formatPrice(total)} with Razorpay`}
                        <span className="material-symbols-outlined">lock</span>
                      </button>
                    ) : (
                      <PayPalScriptProvider
                        options={{
                          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                          currency: 'USD'
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: 'horizontal', color: 'gold', shape: 'pill', label: 'pay' }}
                          createOrder={handlePaypalCreateOrder}
                          onApprove={handlePaypalApprove}
                        />
                      </PayPalScriptProvider>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
