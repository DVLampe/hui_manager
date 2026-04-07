'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import io from 'socket.io-client'
import { Clock, Crown, Gavel, History, Timer, Trophy, X, Activity, AlertCircle } from 'lucide-react'
import NumberInput from '@/components/ui/NumberInput'
import Button from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'
import { useIsMobile } from '@/lib/hooks'

const formatSeconds = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--'
  const safe = Math.max(0, Math.floor(seconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const AuctionWindow = ({ hui, session, isOpen, onClose, isGuestView = false, onPrefillHotHui = () => {}, canManage = false }) => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
  const [auctionState, setAuctionState] = useState({ auction: null, history: [] })
  const [bidAmount, setBidAmount] = useState('')
  const [startPrice, setStartPrice] = useState(50000)
  const [startBidStep, setStartBidStep] = useState(50000)
  const [maxPrice, setMaxPrice] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('')
  const [activeTab, setActiveTab] = useState('current')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [winnerBanner, setWinnerBanner] = useState(null)
  const [connectionInfo, setConnectionInfo] = useState({ connected: false, url: socketUrl })
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 40, y: 40 })
  const dragOffset = useRef({ x: 0, y: 0 })
  const windowRef = useRef(null)
  const socketRef = useRef(null)
  const bannerTimeoutRef = useRef(null)
  const isMobile = useIsMobile()

  const takenMemberIds = useMemo(
    () => new Set((hui?.payments || []).map((p) => p.potTakerMemberId).filter(Boolean)),
    [hui]
  )
  const myMember = useMemo(
    () => (hui?.members || []).find((m) => m.userId === session?.user?.id),
    [hui, session]
  )
  const isHuiSong = !!myMember && !takenMemberIds.has(myMember?.id)
  const canBid = !isGuestView && !!myMember && isHuiSong

  const canControlAuction = useMemo(() => {
    if (session?.user?.role === 'ADMIN') return true
    if (canManage) return true
    if (hui?.ownerId === session?.user?.id) return true
    return hui?.permissions?.some((p) => p.userId === session?.user?.id && p.permission === 'MANAGE')
  }, [canManage, hui?.ownerId, hui?.permissions, session?.user?.id, session?.user?.role])

  const highestBid = auctionState.auction?.highestBid
  const winningBid = auctionState.auction?.winningBid
  const startPriceValue = Number(auctionState.auction?.startPrice ?? startPrice ?? 0) || 0
  const maxPriceValue =
    auctionState.auction?.maxPrice !== undefined && auctionState.auction?.maxPrice !== null
      ? Number(auctionState.auction?.maxPrice)
      : null
  const bidStepValue = Number(auctionState.auction?.bidStep ?? startBidStep ?? 0) || 0
  const minNextBid =
    auctionState.auction?.minNextBid !== undefined && auctionState.auction?.minNextBid !== null
      ? Number(auctionState.auction?.minNextBid)
      : startPriceValue
  const minBid = maxPriceValue !== null ? Math.min(minNextBid, maxPriceValue) : minNextBid
  const yourBid = useMemo(() => {
    if (!auctionState.auction?.bids || !session?.user?.id) return null
    const myBids = auctionState.auction.bids.filter((b) => b.userId === session.user.id)
    if (!myBids.length) return null
    return myBids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
  }, [auctionState.auction, session])

  const leaderName = highestBid?.user?.name || 'Chưa có'

  const persistWinnerBanner = useCallback(
    (auction) => {
      if (!auction?.winningBid) return
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
      const payload = {
        winningBid: auction.winningBid,
        roundLabel: auction.roundLabel,
        expiresAt: Date.now() + 5 * 60 * 1000,
      }
      setWinnerBanner(payload)
      bannerTimeoutRef.current = setTimeout(() => setWinnerBanner(null), 5 * 60 * 1000)
    },
    []
  )

  useEffect(
    () => () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    },
    []
  )

  useEffect(() => {
    if (!minBid) return
    setBidAmount((prev) => {
      const numPrev = Number(prev) || 0
      if (!numPrev || numPrev < minBid) return minBid
      return numPrev
    })
  }, [minBid, auctionState.auction?.id])

  useEffect(() => {
    if (!auctionState.auction) return
    const bidCount = auctionState.auction.bids?.length || 0
    if (auctionState.auction.status === 'ACTIVE' && bidCount === 0) {
      setBidAmount(minBid)
    }
  }, [auctionState.auction?.id, auctionState.auction?.status, auctionState.auction?.bids?.length, minBid])

  const startDrag = (e) => {
    if (isMobile) return
    if (!windowRef.current) return
    const rect = windowRef.current.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setDragging(true)
  }

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging) return
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y })
    },
    [dragging]
  )

  const handleMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (!isOpen || !hui?.id) {
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current = null
        }
      }
    }

    const socket = io(socketUrl)
    socketRef.current = socket
    socket.emit('auction:join', { huiId: hui.id })

    socket.on('connect', () => setConnectionInfo({ connected: true, url: socketUrl }))
    socket.on('disconnect', () => setConnectionInfo({ connected: false, url: socketUrl }))
    socket.on('connect_error', (err) => {
      setConnectionInfo({ connected: false, url: socketUrl })
      setError(`Không kết nối được server đấu giá (${socketUrl}). Kiểm tra mạng, cổng 3001 và NEXT_PUBLIC_SOCKET_URL. ${err?.message || ''}`.trim())
    })

    socket.on('auction:state', ({ auction }) => {
      setAuctionState((prev) => ({ ...prev, auction }))
      setError(null)
    })
    socket.on('auction:history', (history) => {
      setAuctionState((prev) => ({ ...prev, history: history || [] }))
    })
    socket.on('auction:started', () => {
      setInfo('Đấu giá đã bắt đầu')
    })
    socket.on('auction:ended', ({ auction, reason }) => {
      setAuctionState((prev) => ({ ...prev, auction }))
      if (reason === 'max-price') {
        setInfo('Đấu giá đã chạm giá tối đa và tự động kết thúc')
      } else {
        setInfo('Đấu giá đã kết thúc')
      }
      persistWinnerBanner(auction)
    })
    socket.on('auction:error', (payload) => {
      setError(payload?.message || 'Có lỗi xảy ra trong phiên đấu giá')
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [hui?.id, isOpen, socketUrl])

  useEffect(() => {
    if (!auctionState.auction?.endTime || auctionState.auction?.status !== 'ACTIVE') {
      setRemainingSeconds(null)
      return
    }
    const update = () => {
      const ms = new Date(auctionState.auction.endTime).getTime() - Date.now()
      setRemainingSeconds(Math.max(0, Math.floor(ms / 1000)))
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [auctionState.auction?.endTime, auctionState.auction?.status])

  useEffect(() => {
    if (auctionState.auction?.status !== 'ENDED' || !auctionState.auction?.winningBid) return
    if (winnerBanner?.winningBid?.id === auctionState.auction.winningBid.id) return
    persistWinnerBanner(auctionState.auction)
  }, [auctionState.auction?.id, auctionState.auction?.status, auctionState.auction?.winningBid, winnerBanner?.winningBid?.id, persistWinnerBanner])

  const handleStartAuction = () => {
    if (!socketRef.current) {
      setError('Không kết nối được máy chủ đấu giá (socket). Kiểm tra NEXT_PUBLIC_SOCKET_URL hoặc mạng nội bộ.')
      return
    }
    if (!canControlAuction) {
      setError('Chỉ chủ hụi hoặc người quản lý được phép mở đấu giá.')
      return
    }
    const startPriceNumber = Number(startPrice)
    const bidStepNumber = Number(startBidStep)
    const maxPriceNumber = maxPrice === '' ? null : Number(maxPrice)
    const durationNumber = durationSeconds === '' ? null : Number(durationSeconds)

    if (!Number.isFinite(startPriceNumber) || startPriceNumber <= 0) {
      setError('Giá khởi điểm phải lớn hơn 0.')
      return
    }
    if (!Number.isFinite(bidStepNumber) || bidStepNumber <= 0) {
      setError('Bước giá phải lớn hơn 0.')
      return
    }
    if (maxPriceNumber !== null && (!Number.isFinite(maxPriceNumber) || maxPriceNumber < startPriceNumber)) {
      setError('Giá tối đa phải lớn hơn hoặc bằng giá khởi điểm.')
      return
    }
    if (durationNumber !== null && (!Number.isFinite(durationNumber) || durationNumber <= 0)) {
      setError('Thời gian đấu giá phải lớn hơn 0 hoặc để trống.')
      return
    }

    setError(null)
    socketRef.current.emit('auction:start', {
      huiId: hui.id,
      userId: session.user.id,
      startPrice: startPriceNumber,
      bidStep: bidStepNumber,
      maxPrice: maxPriceNumber,
      durationSeconds: durationNumber,
      roundLabel: `Phiên ${hui?.currentCycle || ''}`.trim(),
    })
  }

  const handlePlaceBid = () => {
    if (!socketRef.current || !auctionState.auction) return
    setError(null)
    socketRef.current.emit('auction:bid', {
      huiId: hui.id,
      auctionId: auctionState.auction.id,
      userId: session.user.id,
      amount: Number(bidAmount),
    })
    setBidAmount('')
  }

  const handleEndAuction = () => {
    if (!socketRef.current || !auctionState.auction) return
    socketRef.current.emit('auction:end', {
      huiId: hui.id,
      auctionId: auctionState.auction.id,
      userId: session.user.id,
    })
  }

  const handlePrefillHotHui = () => {
    const bid = winnerBanner?.winningBid || winningBid
    if (!bid) return
    const winnerMember = hui?.members?.find((m) => m.userId === bid.userId)
    onPrefillHotHui({ memberId: winnerMember?.id, thamKeu: bid.amount })
  }

  if (!isOpen) return null

  const bannerBid = winnerBanner?.winningBid
  const statusBadge = (auctionState.auction?.status || 'PENDING')
  const liveBids = (auctionState.auction?.bids || []).slice(-10).reverse()

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none">
      <div
        ref={windowRef}
        className="absolute w-full max-w-4xl pointer-events-auto bg-white shadow-2xl border border-gray-200 rounded-lg md:rounded-2xl"
        style={{
          transform: isMobile ? 'translate(0px, 0px)' : `translate(${position.x}px, ${position.y}px)`,
          left: isMobile ? '8px' : undefined,
          right: isMobile ? '8px' : undefined,
          top: isMobile ? '8px' : undefined,
        }}
      >
        <div
          className={`flex items-center justify-between px-4 py-3 border-b bg-gray-50 ${isMobile ? '' : 'cursor-move'} rounded-t-2xl`}
          onMouseDown={startDrag}
        >
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-gray-800">Đấu hụi</span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">{statusBadge.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            {info && <span className="text-xs text-green-600">{info}</span>}
            <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-red-50 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
              <Gavel className="w-4 h-4 text-red-500" />
              <span>Giá khởi điểm: {formatNumber(startPriceValue)}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
              <Timer className="w-4 h-4 text-red-500" />
              <span>Tối thiểu kế tiếp: {formatNumber(minNextBid)}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Giá tối đa: {maxPriceValue !== null ? formatNumber(maxPriceValue) : 'Không giới hạn'}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${connectionInfo.connected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              <Activity className="w-4 h-4" />
              <span>{connectionInfo.connected ? 'Đã kết nối socket' : 'Mất kết nối socket'}</span>
            </div>
            {auctionState.auction?.endTime && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Đếm ngược: {formatSeconds(remainingSeconds)}</span>
              </div>
            )}
            {yourBid && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg text-sm text-green-700">
                <Trophy className="w-4 h-4" />
                <span>Giá của bạn: {formatNumber(yourBid.amount)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'current' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveTab('current')}
            >
              Phiên hiện tại
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'history' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              Lịch sử
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'controls' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveTab('controls')}
            >
              Điều khiển
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-xs text-amber-700 uppercase tracking-wide">Đang dẫn</p>
                  <p className="text-lg font-bold text-gray-900">{leaderName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-xs text-blue-700 uppercase tracking-wide">Giá cao nhất</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(highestBid?.amount || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {bannerBid && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 p-4 rounded-xl border border-green-200 bg-green-50">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-700 uppercase tracking-wide">Kết quả</p>
                  <p className="text-base font-semibold text-gray-900">
                    {bannerBid.user?.name || 'Người thắng'} thắng với giá {formatNumber(bannerBid.amount)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <Button
                  onClick={() => {
                    handlePrefillHotHui()
                    onClose()
                  }}
                  disabled={!canControlAuction}
                  className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white"
                >
                  Hốt hụi theo giá thắng
                </Button>
                {!canControlAuction && <span className="text-xs text-gray-500">Chỉ chủ hụi hoặc người quản lý có thể hốt.</span>}
              </div>
            </div>
          )}
          
          {activeTab === 'current' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <History className="w-4 h-4" />
                    <span>Luồng giá mới nhất</span>
                  </div>
                  <span className="text-xs text-gray-500">{liveBids.length} lượt</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {liveBids.length === 0 && <p className="text-sm text-gray-500">Chưa có lượt đặt giá.</p>}
                  {liveBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{bid.user?.name || 'Ẩn danh'}</p>
                        <p className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleTimeString('vi-VN')}</p>
                      </div>
                      <p className="text-sm font-bold text-red-600">{formatNumber(bid.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-2">Đặt giá của bạn</p>
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    onClick={() => setBidAmount((prev) => Math.max(minBid, (Number(prev) || minBid) - bidStepValue))}
                    variant="secondary"
                    size="md"
                    disabled={!canBid || auctionState.auction?.status !== 'ACTIVE'}
                    className="w-12 h-11 flex items-center justify-center"
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center border border-gray-200 rounded-lg py-2 text-lg font-semibold text-gray-900 bg-gray-50">
                    {formatNumber(bidAmount || minBid || 0)}
                  </div>
                  <Button
                    onClick={() =>
                      setBidAmount((prev) => {
                        const nextValue = (Number(prev) || minBid) + bidStepValue
                        return maxPriceValue !== null ? Math.min(nextValue, maxPriceValue) : nextValue
                      })
                    }
                    size="md"
                    disabled={!canBid || auctionState.auction?.status !== 'ACTIVE'}
                    className="w-12 h-11 flex items-center justify-center"
                  >
                    +
                  </Button>
                </div>
                <Button
                  onClick={handlePlaceBid}
                  disabled={
                    !canBid ||
                    auctionState.auction?.status !== 'ACTIVE' ||
                    !bidAmount ||
                    Number(bidAmount) < minBid ||
                    (maxPriceValue !== null && Number(bidAmount) > maxPriceValue)
                  }
                  className="w-full"
                >
                  Đặt giá
                </Button>
                {!canBid && (
                  <p className="text-xs text-gray-500 mt-2">Chỉ thành viên hụi sống mới có thể đấu giá.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              {auctionState.history.length === 0 && <p className="text-sm text-gray-500">Chưa có phiên đấu giá nào kết thúc.</p>}
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto pr-2">
                {auctionState.history.map((item, index) => {
                  const label = item.roundLabel || `Phiên ${index + 1}`
                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500">{item.endedAt ? new Date(item.endedAt).toLocaleString('vi-VN') : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">Giá thắng: {formatNumber(item.winningBid?.amount || 0)}</p>
                        <p className="text-xs text-gray-500">Người thắng: {item.winningBid?.user?.name || 'N/A'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Thiết lập phiên đấu giá</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Giá khởi điểm tối thiểu</label>
                    <NumberInput value={startPrice} onChange={(e) => setStartPrice(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Bước giá tối thiểu</label>
                    <NumberInput value={startBidStep} onChange={(e) => setStartBidStep(e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Giá tối đa <span className="text-gray-400">(∞ = không giới hạn)</span></label>
                    <NumberInput value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full placeholder:text-xl placeholder:pl-0.5" placeholder="∞" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Thời gian đấu (giây) <span className="text-gray-400">(∞ = không giới hạn)</span></label>
                    <NumberInput value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} className="w-full placeholder:text-xl placeholder:pl-0.5" placeholder="∞" />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <Button
                    onClick={handleStartAuction}
                    disabled={!canControlAuction || auctionState.auction?.status === 'ACTIVE'}
                    className="flex-1"
                  >
                    Bắt đầu đấu giá
                  </Button>
                  <Button
                    onClick={handleEndAuction}
                    variant="secondary"
                    disabled={!canControlAuction || auctionState.auction?.status !== 'ACTIVE'}
                    className="flex-1"
                  >
                    Kết thúc
                  </Button>
                </div>
                {!canControlAuction && <p className="text-xs text-gray-500 mt-2">Chỉ chủ hụi hoặc người quản lý được phép khởi tạo và kết thúc đấu giá.</p>}
              </div>
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-3 text-sm text-gray-600">
                <p className="font-semibold text-gray-800 mb-2">Luật tóm tắt</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Giá mở đầu từ mức giá khởi điểm.</li>
                  <li>Giá mới = giá cao nhất + bước giá.</li>
                  <li>Nếu đặt chạm giá tối đa thì phiên tự kết thúc.</li>
                  <li>Đặt trong 10s cuối sẽ cộng thêm 30s.</li>
                  <li>Chỉ hụi sống được đặt giá.</li>
                  <li>Hết giờ sẽ khóa đấu giá.</li>
                  <li>Chủ hụi ấn kết thúc để chốt phiên.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuctionWindow
