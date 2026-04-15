import React from 'react';
import ContinueButton from './ContinueButton';
import UpcomingOccasionBanner from './UpcomingOccasionBanner';
import OccasionGrid from './OccasionGrid';

const CreateBook = () => {
  return (
    <div>
      <UpcomingOccasionBanner />
      <ContinueButton />
      <OccasionGrid />
    </div>
  );
};

export default CreateBook;