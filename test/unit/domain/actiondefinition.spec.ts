import { ActionDefinition } from '../../../src/domain/actions/actionDefinition';
import { TypeAction } from '../../../src/domain/actions/typeAction';

describe('Classe ActionDefinition', () => {
  it(`getTypeCodeFromString  - chaine arbitraire => code`, () => {
    // GIVEN
    // WHEN
    const type_code = ActionDefinition.getTypeCodeFromString('123abc');

    // THEN
    expect(type_code).toEqual({ code: '123abc', type: undefined });
  });
  it(`getTypeCodeFromString  - chaine vide`, () => {
    // GIVEN
    // WHEN
    const type_code = ActionDefinition.getTypeCodeFromString('');

    // THEN
    expect(type_code).toEqual({ code: undefined, type: undefined });
  });
  it(`getTypeCodeFromString  - null`, () => {
    // GIVEN
    // WHEN
    const type_code = ActionDefinition.getTypeCodeFromString(null);

    // THEN
    expect(type_code).toEqual({ code: undefined, type: undefined });
  });
  it(`getTypeCodeFromString  - a_b_c`, () => {
    // GIVEN
    // WHEN
    const type_code = ActionDefinition.getTypeCodeFromString('a_b_c');

    // THEN
    expect(type_code).toEqual({ code: 'b_c', type: undefined });
  });
  it(`getTypeCodeFromString  - a_`, () => {
    // GIVEN
    // WHEN
    const type_code = ActionDefinition.getTypeCodeFromString('a_');

    // THEN
    expect(type_code).toEqual({ code: '', type: undefined });
  });
  it(`getTypeCodeFromString  - bilan_a`, () => {
    // GIVEN
    // WHEN
    const type_code = ActionDefinition.getTypeCodeFromString('bilan_a');

    // THEN
    expect(type_code).toEqual({ code: 'a', type: TypeAction.bilan });
  });
});
