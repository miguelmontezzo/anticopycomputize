import React from 'react';
import { useParams } from 'react-router-dom';
import ContentCalendarBoard from '../components/ContentCalendarBoard';

export default function AdminCalendarPage() {
  const { slug = 'computo' } = useParams();
  return <ContentCalendarBoard slug={slug} adminMode />;
}
