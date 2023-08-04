import { Interaction } from '../../../../src/domain/interaction/interaction';

describe('Interaction', () => {
  it('setNextScheduledReset : should compute OK next day schedule', () => {
    // GIVEN
    const scheduledInteraction = new Interaction({ day_period: 1 });

    // WHEN
    const demainMinuit = scheduledInteraction.setNextScheduledReset();

    // THEN
    expect(demainMinuit.getTime()).toBeGreaterThan(new Date().getTime());
    expect(demainMinuit.getTime()).toBeLessThan(
      new Date().getTime() + 86400000,
    );
    expect(demainMinuit.getHours()).toEqual(0);
    expect(demainMinuit.getMinutes()).toEqual(0);
    expect(demainMinuit.getSeconds()).toEqual(0);
    expect(demainMinuit).toEqual(scheduledInteraction.scheduled_reset);
  });
  it('setNextScheduledReset : should compute null when no day period', () => {
    // GIVEN
    const scheduledInteraction = new Interaction({ day_period: null });

    // WHEN
    const result = scheduledInteraction.setNextScheduledReset();

    // THEN
    expect(result).toBeNull();
    expect(scheduledInteraction.scheduled_reset).toBeNull();
  });
});
