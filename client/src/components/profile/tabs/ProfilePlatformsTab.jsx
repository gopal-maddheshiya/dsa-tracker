import React from 'react';
import Reveal from '../../common/Reveal';
import PlatformSyncHub from '../PlatformSyncHub';

const ProfilePlatformsTab = ({ onSyncSuccess }) => {
  return (
    <div className="space-y-6 animate-fade-up">
      <Reveal delay={40} y={15}>
        <PlatformSyncHub onSyncSuccess={onSyncSuccess} />
      </Reveal>
    </div>
  );
};

export default ProfilePlatformsTab;
