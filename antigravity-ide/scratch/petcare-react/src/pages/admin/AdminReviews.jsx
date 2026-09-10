import React from 'react';
import AdminGenericPage from './AdminGenericPage';

const AdminReviews = () => {
  const reviews = [
    { pet: 'Barnaby', owner: 'Eleanor Vance', vet: 'Dr. Marcus Sterling', rating: 5, comment: 'Dr. Sterling was compassionate and patient throughout the call. My dog is feeling so much better!', date: 'Today' },
    { pet: 'Rory', owner: 'Sophia Chen', vet: 'Dr. Neil Roberts', rating: 5, comment: 'Quick response during an emergency scare. Thank you for walking me through what to do step by step!', date: 'Today' },
    { pet: 'Cleo', owner: 'Liam Henderson', vet: 'Dr. Chloe Aris', rating: 4, comment: 'Very knowledgeable on feline allergies. The prescribed treatment plan was clear.', date: 'Yesterday' },
    { pet: 'Zeus', owner: 'David Miller', vet: 'Dr. Sarah Jenkins', rating: 5, comment: 'Exceptional clinical advice. Saved us an unnecessary trip to the hospital.', date: '2 days ago' }
  ];

  return (
    <AdminGenericPage
      title="Veterinary Reviews & Patient Feedback"
      subtitle="Monitor clinical satisfaction ratings, quality assurance logs, and client testimonials."
      icon="grade"
      stats={[
        { label: 'Overall Rating', value: '4.92 ★', sub: '98.6% positive', icon: 'star' },
        { label: 'Total Reviews', value: '2,840', sub: '+48 this week', icon: 'rate_review' },
        { label: '5-Star Ratings', value: '92.4%', sub: 'Exemplary standard', icon: 'military_tech' }
      ]}
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
        <h3 className="font-['Manrope'] text-base font-bold text-on-surface">Recent Feedback Submissions</h3>
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  <span>{r.owner} (Pet: {r.pet})</span>
                  <span className="text-on-surface-variant font-normal">reviewed</span>
                  <span className="text-primary font-semibold">{r.vet}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {'★'.repeat(r.rating)}
                  <span className="text-on-surface-variant text-[0.6875rem] font-normal ml-1">{r.date}</span>
                </div>
              </div>
              <p className="text-on-surface-variant italic">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </AdminGenericPage>
  );
};

export default AdminReviews;
