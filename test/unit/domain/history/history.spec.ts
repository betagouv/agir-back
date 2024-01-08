import { History } from '../../../../src/domain/history/history';

describe('History', () => {
  it('WHEN un vie historique ok', () => {
    // WHEN
    const history = History.newHistory();

    // THEN
    expect(history.nombreArticles()).toEqual(0);
  });
  it('cree un historique ok', () => {
    // GIVEN
    const history = new History({
      article_interactions: [
        {
          content_id: '1',
          like_level: 2,
          points_en_poche: true,
          read_date: new Date(123),
        },
      ],
    });

    // WHEN
    const article = history.getArticleHistoryById('1');

    // THEN
    expect(article.content_id).toEqual('1');
    expect(article.like_level).toEqual(2);
    expect(article.points_en_poche).toEqual(true);
    expect(article.read_date.getTime()).toEqual(123);
  });
  it('lire un nouveau article insert un nouveau aricle', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.articleLu('1');

    // THEN
    expect(history.nombreArticles()).toEqual(1);
  });
  it('on peut lire 2 fois le meme article', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.articleLu('1');
    history.articleLu('1');

    // THEN
    expect(history.nombreArticles()).toEqual(1);
  });
  it('lire un aricle valorise la date de lecture', () => {
    // GIVEN
    const history = new History({});

    // WHEN
    history.articleLu('1');

    // THEN
    const article = history.getArticleHistoryById('1');
    expect(article.read_date.getTime()).toBeGreaterThan(Date.now() - 100);
  });
  it('dire qu on a empoché les points', () => {
    // GIVEN
    const history = new History({});
    history.articleLu('1');

    // THEN
    expect(history.getArticleHistoryById('1').points_en_poche).toStrictEqual(
      false,
    );

    // WHEN
    history.metPointsArticleEnPoche('1');

    // THEN
    const article = history.getArticleHistoryById('1');
    expect(article.points_en_poche).toStrictEqual(true);
  });
});
