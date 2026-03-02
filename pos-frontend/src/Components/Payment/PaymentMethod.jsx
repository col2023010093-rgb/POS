import { useState } from 'react';
import './PaymentMethod.css';

export default function PaymentMethod({ onMethodSelect }) {
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = [
    { id: 'credit-card', label: 'Credit/Debit Card', icon: '💳' },
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'digital-wallet', label: 'Digital Wallet', icon: '📱' }
  ];

  const handleSelect = (methodId) => {
    setSelectedMethod(methodId);
    onMethodSelect(methodId);
  };

  return (
    <div className="payment-method-container">
      <h3>Select Payment Method</h3>
      <div className="payment-options">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            className={`payment-option ${selectedMethod === method.id ? 'active' : ''}`}
            onClick={() => handleSelect(method.id)}
          >
            <span className="icon">{method.icon}</span>
            <span className="label">{method.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}