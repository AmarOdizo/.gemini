import React from 'react';
import AdminGenericPage from './AdminGenericPage';

const AdminPrescriptions = () => {
  const prescriptions = [
    { id: 'RX-901', pet: 'Barnaby', owner: 'Eleanor Vance', vet: 'Dr. Marcus Sterling', medication: 'Amoxicillin 250mg', dosage: '1 tab every 12 hrs', date: 'Today', status: 'Fulfilled' },
    { id: 'RX-902', pet: 'Cleo', owner: 'Liam Henderson', vet: 'Dr. Chloe Aris', medication: 'Apoquel 5.4mg', dosage: '1 tab daily', date: 'Today', status: 'Active' },
    { id: 'RX-903', pet: 'Rory', owner: 'Sophia Chen', vet: 'Dr. Neil Roberts', medication: 'Salbutamol Inhaler', dosage: 'As needed during panting', date: 'Today', status: 'Active' },
    { id: 'RX-904', pet: 'Zeus', owner: 'David Miller', vet: 'Dr. Sarah Jenkins', medication: 'Carprofen 75mg', dosage: '1 tab once daily with food', date: 'Yesterday', status: 'Fulfilled' }
  ];

  return (
    <AdminGenericPage
      title="Electronic Prescriptions & Pharmacy Audit"
      subtitle="Comprehensive ledger of electronic veterinary prescriptions, pharmacy fulfillments, and controlled drug compliance."
      icon="prescriptions"
      stats={[
        { label: 'Total Issued', value: '4,210', sub: '+84 this week', icon: 'prescriptions' },
        { label: 'Active Fulfillments', value: '312', sub: 'Pharmacy partners', icon: 'local_pharmacy' },
        { label: 'Controlled Drugs (DEA)', value: '18', sub: '100% audit compliant', icon: 'verified' }
      ]}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/20 font-bold text-sm text-on-surface">
          Recent Prescription Audit Log
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="p-4 font-bold">RX ID</th>
                <th className="p-4 font-bold">Patient / Pet</th>
                <th className="p-4 font-bold">Owner</th>
                <th className="p-4 font-bold">Prescribing Doctor</th>
                <th className="p-4 font-bold">Medication & Dosage</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-surface-container-low/40">
                  <td className="p-4 font-mono font-bold text-primary">{rx.id}</td>
                  <td className="p-4 font-bold text-on-surface">{rx.pet}</td>
                  <td className="p-4 text-on-surface">{rx.owner}</td>
                  <td className="p-4 text-primary font-semibold">{rx.vet}</td>
                  <td className="p-4">
                    <div className="font-semibold text-on-surface">{rx.medication}</div>
                    <div className="text-[0.6875rem] text-on-surface-variant">{rx.dosage}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant">{rx.date}</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold bg-secondary-container text-on-secondary-container">
                      {rx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGenericPage>
  );
};

export default AdminPrescriptions;
