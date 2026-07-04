import React, { forwardRef } from 'react';
import { numberToWords } from '../utils/numberToWords';

const InvoiceDocument = forwardRef(({ student, payment, monthName }, ref) => {
  if (!student || !payment) return <div ref={ref}></div>;

  return (
    <div ref={ref} style={{
      padding: '40px',
      background: '#fff',
      color: '#000',
      fontFamily: "'Poppins', sans-serif",
      width: '800px',
      minHeight: '1120px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      <div style={{
        border: '4px solid #000',
        padding: '30px',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
          <h1 style={{ 
            fontFamily: "'Pathway Gothic One', 'Montenegrin Gothic One', 'Gothic A1', sans-serif", 
            fontSize: '48px', 
            textTransform: 'uppercase', 
            margin: '0',
            letterSpacing: '2px'
          }}>
            Partha Sir's Tuition Invoice
          </h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: '600' }}>FEE RECEIPT</p>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <div>
            <p style={{ margin: '0 0 10px 0' }}><strong>Student Name:</strong> {student.name}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Phone Number:</strong> {student.phone}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Subjects:</strong> {student.subjects || 'N/A'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 10px 0' }}><strong>Date of Payment:</strong> {new Date(payment.payment_date || payment.date).toLocaleDateString()}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Receipt No:</strong> {payment.id || Date.now()}</p>
            <p style={{ margin: '0 0 10px 0' }}><strong>Month:</strong> {monthName}</p>
          </div>
        </div>

        {/* Payment Details Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000', padding: '15px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Description</th>
              <th style={{ border: '2px solid #000', padding: '15px', textAlign: 'right', backgroundColor: '#f0f0f0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '2px solid #000', padding: '15px' }}>
                Tuition Fee for {monthName}
              </td>
              <td style={{ border: '2px solid #000', padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                ₹{payment.amount}
              </td>
            </tr>
            <tr>
              <td style={{ border: '2px solid #000', padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>Total Paid</td>
              <td style={{ border: '2px solid #000', padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '20px' }}>
                ₹{payment.amount}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Words and Mode */}
        <div style={{ marginBottom: 'auto' }}>
          <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>
            <strong>Amount in Words:</strong> {numberToWords(payment.amount)}
          </p>
          <p style={{ fontSize: '16px', margin: '0' }}>
            <strong>Mode of Payment:</strong> <span style={{ textTransform: 'capitalize' }}>{payment.payment_method || payment.paymentMethod || 'Offline'}</span>
          </p>
        </div>

        {/* Signature */}
        <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ 
              fontFamily: "'Dancing Script', 'Caveat', cursive", 
              fontSize: '32px', 
              color: '#000',
              borderBottom: '1px solid #000',
              paddingBottom: '10px',
              marginBottom: '10px'
            }}>
              Partha Sarathi Dey
            </div>
            <div style={{ fontWeight: '600' }}>Authorized Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoiceDocument;
