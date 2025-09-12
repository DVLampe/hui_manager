'use client';

import { useState, useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const LuckyWheelModal = ({ isOpen, onClose, members }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState(null);
  
  const [wheelSize, setWheelSize] = useState(0);
  const wheelContainerRef = useRef(null);

  const wheelData = members.map(member => ({
    option: member.label.substring(0, 20) + (member.label.length > 20 ? '...' : ''),
    ...member
  }));

  const handleSpinClick = () => {
    if (!mustSpin && wheelData.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setWinner(null);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setWinner(wheelData[prizeNumber]);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (wheelContainerRef.current) {
          setWheelSize(wheelContainerRef.current.clientWidth);
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setWheelSize(0);
      setWinner(null);
      setMustSpin(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="VÒNG QUAY MAY MẮN" size="lg">
      <div className="flex flex-col items-center justify-center p-4">
        {winner && (
          <div className="my-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            <h3 className="text-xl font-bold">Thành viên may mắn!</h3>
            <p className="text-lg">{winner.label}</p>
          </div>
        )}

        <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center my-4" ref={wheelContainerRef}>
          {/* Render Wheel only when its container has a measured size */}
          {wheelSize > 0 && wheelData.length > 0 ? (
            <Wheel
              key={wheelSize} // Force re-mount with correct size
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleStopSpinning}
              backgroundColors={['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71']}
              textColors={['#ffffff']}
              outerBorderColor={'#D2B48C'}
              outerBorderWidth={10}
              radiusLineColor={'#D2B48C'}
              radiusLineWidth={2}
              fontSize={14}
              spinningTime={40} // Corresponds to ~8-10 spins
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p>{members.length === 0 ? 'Không có thành viên nào để quay.' : 'Loading...'}</p>
            </div>
          )}
        </div>

        <Button
          onClick={handleSpinClick}
          disabled={mustSpin || wheelData.length === 0 || wheelSize === 0}
          className="mt-6"
          variant="primary"
        >
          {mustSpin ? 'Đang quay...' : 'Quay'}
        </Button>
      </div>
    </Modal>
  );
};

export default LuckyWheelModal;
