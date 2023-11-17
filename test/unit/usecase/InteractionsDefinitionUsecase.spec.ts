import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { InteractionsDefinitionUsecase } from '../../../src/usecase/cms.usecase';
import { TestUtil } from '../../../test/TestUtil';
import { CMSWebhookAPI } from '../../../src/infrastructure/api/types/cms/CMSWebhookAPI';
import { CMSModel } from '../../../src/infrastructure/api/types/cms/CMSModels';
import { fail } from 'assert/strict';

describe('InteractionDefinitionUsecase', () => {
  it('buildInteractionDefFromCMSData : map properly model to type', () => {
    // GIVEN
    const cms_data: CMSWebhookAPI = TestUtil.CMSWebhookAPIData();

    // WHEN
    const result =
      InteractionsDefinitionUsecase.buildInteractionDefFromCMSData(cms_data);

    // THEN
    expect(result.type).toEqual(InteractionType.article);
  });
  it('buildInteractionDefFromCMSData : HTTP exception when type not mapped', () => {
    // GIVEN
    const cms_data: CMSWebhookAPI = TestUtil.CMSWebhookAPIData();
    cms_data.model = CMSModel.unkown;

    // WHEN
    try {
      InteractionsDefinitionUsecase.buildInteractionDefFromCMSData(cms_data);
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Model de contenu CMS [unkown] manquant ou inconnu',
      );
    }
  });
});
