import { Article } from '../../../src/domain/article';
import { ContentRecommandation } from '../../../src/domain/ContentRecommandation';

describe('ContentRecommandation', () => {
  const ARTICLE: Article = {
    content_id: '123',
    titre: 'titre',
    image_url: '',
    rubrique_ids: [],
    rubrique_labels: [],
    codes_postaux: [],
    difficulty: 1,
    points: 0,
    thematiques: [],
    thematique_principale: null,
  };

  it('append : append OK', () => {
    // GIVEN
    const reco = new ContentRecommandation();

    // WHEN
    reco.append(10, 'A');

    // THEN
    expect(reco.liste).toHaveLength(1);
    expect(reco.liste[0].score).toEqual(10);
    expect(reco.liste[0].content_id).toEqual('A');
  });
  it('filterAndOrderArticles : order OK', () => {
    // GIVEN
    const reco = new ContentRecommandation();
    reco.append(10, 'A');
    reco.append(20, 'B');
    reco.append(30, 'C');

    const a: Article = { ...ARTICLE, content_id: 'A' };
    const b: Article = { ...ARTICLE, content_id: 'B' };
    const c: Article = { ...ARTICLE, content_id: 'C' };

    // WHEN
    const result = reco.filterAndOrderArticlesOrQuizzes([c, a, b]);

    // THEN
    expect(result).toHaveLength(3);
    expect(result[0].content_id).toEqual('A');
    expect(result[1].content_id).toEqual('B');
    expect(result[2].content_id).toEqual('C');
  });
  it('filterAndOrderArticles : exclude when missing reco', () => {
    // GIVEN
    const reco = new ContentRecommandation();
    reco.append(10, 'A');
    reco.append(20, 'B');

    const a: Article = { ...ARTICLE, content_id: 'A' };
    const b: Article = { ...ARTICLE, content_id: 'B' };
    const c: Article = { ...ARTICLE, content_id: 'C' };

    // WHEN
    const result = reco.filterAndOrderArticlesOrQuizzes([c, a, b]);

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0].content_id).toEqual('A');
    expect(result[1].content_id).toEqual('B');
  });
  it('filterAndOrderArticles : order OK même si trop de reco', () => {
    // GIVEN
    const reco = new ContentRecommandation();
    reco.append(10, 'A');
    reco.append(20, 'B');
    reco.append(30, 'C');
    reco.append(40, 'D');

    const a: Article = { ...ARTICLE, content_id: 'A' };
    const b: Article = { ...ARTICLE, content_id: 'B' };
    const c: Article = { ...ARTICLE, content_id: 'C' };

    // WHEN
    const result = reco.filterAndOrderArticlesOrQuizzes([c, a, b]);

    // THEN
    expect(result).toHaveLength(3);
    expect(result[0].content_id).toEqual('A');
    expect(result[1].content_id).toEqual('B');
    expect(result[2].content_id).toEqual('C');
  });
});
