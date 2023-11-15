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
      Math.round(serviceDefinition.scheduled_refresh.getTime() / 10000),
    ).toEqual(Math.round(Date.now() / 10000) + 60);
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
  it('isLiveServiceType : true si l id fait partie de l enum des srvices lives', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      serviceDefinitionId: 'dummy_live',
    });

    // WHEN
    const result = serviceDefinition.isLiveServiceType();

    // THEN
    expect(result).toEqual(true);
  });
  it('isLiveServiceType : false si l id ne fait pas partie de l enum des srvices lives', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      serviceDefinitionId: 'other',
    });

    // WHEN
    const result = serviceDefinition.isLiveServiceType();

    // THEN
    expect(result).toEqual(false);
  });
  it('isScheduledServiceType : true si l id fait partie de l enum des srvices scheduled', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      serviceDefinitionId: 'dummy_scheduled',
    });

    // WHEN
    const result = serviceDefinition.isScheduledServiceType();

    // THEN
    expect(result).toEqual(true);
  });
  it('isScheduledServiceType : false si l id fait partie de l enum des srvices scheduled', () => {
    // GIVEN
    const serviceDefinition = new ServiceDefinition({
      ...TestUtil.serviceDefinitionData(),
      serviceDefinitionId: 'other',
    });

    // WHEN
    const result = serviceDefinition.isScheduledServiceType();

    // THEN
    expect(result).toEqual(false);
  });
});
