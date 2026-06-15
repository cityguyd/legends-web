import { QUESTION_BACKGROUNDS } from '@/lib/marketing/assets';

test('marcus-aurelius has a question background', () => {
  expect(QUESTION_BACKGROUNDS['marcus-aurelius']).toBe('/images/questions/marcus-anxiety.png?v=2');
});
