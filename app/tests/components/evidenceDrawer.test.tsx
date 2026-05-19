import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvidenceDrawer } from '../../src/components/primitives/EvidenceDrawer';
import { demoDataset } from '../../src/data/demoDataset';

describe('EvidenceDrawer', () => {
  it('shows source, capture time, sample size, room type, platform, and human review marker', () => {
    const signal = demoDataset.signals[0];

    render(
      <EvidenceDrawer
        open
        heading="证据复核"
        rateKey={demoDataset.trend.series[0].points[0].rateKey}
        source={signal.evidenceMarkers[0].source}
        captureTime={signal.evidenceMarkers[0].captureTime}
        sampleSize={signal.evidenceMarkers[0].sampleSize}
        confidence={signal.evidenceMarkers[0].confidence}
        rationale={signal.summary}
        humanReviewRequired={signal.humanReviewRequired}
      />
    );

    expect(screen.getByText('需人工复核')).toBeVisible();
    expect(screen.getByText(/样本/)).toBeVisible();
    expect(screen.getByText(/房型/)).toBeVisible();
    expect(screen.getByText(/平台/)).toBeVisible();
    expect(screen.getByText(/采集时间/)).toBeVisible();
  });
});
