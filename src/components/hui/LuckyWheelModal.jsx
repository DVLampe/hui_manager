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
    <Modal isOpen={isOpen} onClose={onClose} title="Vòng Quay May Mắn">
      <div className="p-6 text-center">
        {winner && (
          <div className="my-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center">
            <h3 className="text-xl font-bold">Thành viên may mắn!</h3>
            <p className="text-lg">{winner.label}</p>
          </div>
        )}

        <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center my-4 mx-auto" ref={wheelContainerRef}>
          {wheelSize > 0 && wheelData.length > 0 ? (
            <Wheel
              key={wheelSize}
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleStopSpinning}
              backgroundColors={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef']}
              textColors={['#ffffff']}
              outerBorderColor={'#e5e7eb'}
              outerBorderWidth={10}
              radiusLineColor={'#e5e7eb'}
              radiusLineWidth={1}
              fontSize={14}
              spinningTime={40}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <p>{members.length === 0 ? 'Không có thành viên nào để quay.' : 'Đang tải...'}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSpinClick}
          disabled={mustSpin || wheelData.length === 0 || wheelSize === 0}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-semibold"
        >
          {mustSpin ? 'Đang quay...' : 'Quay'}
        </button>
      </div>
    </Modal>
  );
};

export default LuckyWheelModal;
