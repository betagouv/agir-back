import { ServiceDefinition } from '../../../../src/domain/service/serviceDefinition';
import { TestUtil } from '../../../TestUtil';

describe('ServiceDefinition', () => {
  it('setNextRefreshDate : set proper next refresh time ', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      minute_period: 10,
    });

    // WHEN
    serviceDefinition.setNextRefreshDate();

    // THEN
    expect(
      Math.round(serviceDefinition.scheduled_refresh.getTime() / 1000),
    ).toEqual(Math.round(Date.now() / 1000) + 60 * 10);
  });
  it('isReadyForRefresh : true if period and null date', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      minute_period: 10,
      scheduled_refresh: null,
    });

    // WHEN
    const result = serviceDefinition.isReadyForRefresh();

    // THEN
    expect(result).toEqual(true);
  });
  it('isReadyForRefresh : true if period and date before now', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      minute_period: 10,
      scheduled_refresh: new Date(1000),
    });

    // WHEN
    const result = serviceDefinition.isReadyForRefresh();

    // THEN
    expect(result).toEqual(true);
  });
  it('isReadyForRefresh : false if period and date after now', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      minute_period: 10,
      scheduled_refresh: new Date(Date.now() + 10000),
    });

    // WHEN
    const result = serviceDefinition.isReadyForRefresh();

    // THEN
    expect(result).toEqual(false);
  });
});
