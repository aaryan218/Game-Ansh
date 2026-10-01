// Unit tests for the application status state machine
const { BadRequestError } = require('../../shared/errors');
const { assertForwardTransition } = require('./recruitment.service');

describe('Application status machine', () => {
  it('allows applied -> shortlisted', () => {
    expect(() => assertForwardTransition('applied', 'shortlisted')).not.toThrow();
  });
  it('allows shortlisted -> accepted', () => {
    expect(() => assertForwardTransition('shortlisted', 'accepted')).not.toThrow();
  });
  it('allows shortlisted -> rejected', () => {
    expect(() => assertForwardTransition('shortlisted', 'rejected')).not.toThrow();
  });
  it('allows applied -> rejected', () => {
    expect(() => assertForwardTransition('applied', 'rejected')).not.toThrow();
  });
  it('blocks applied -> accepted (skip)', () => {
    expect(() => assertForwardTransition('applied', 'accepted')).toThrow(BadRequestError);
  });
  it('blocks accepted -> shortlisted (terminal)', () => {
    expect(() => assertForwardTransition('accepted', 'shortlisted')).toThrow(BadRequestError);
  });
  it('blocks rejected -> shortlisted (terminal)', () => {
    expect(() => assertForwardTransition('rejected', 'shortlisted')).toThrow(BadRequestError);
  });
  it('blocks any -> applied (backward)', () => {
    expect(() => assertForwardTransition('shortlisted', 'applied')).toThrow(BadRequestError);
  });
  it('blocks shortlisted -> shortlisted (duplicate)', () => {
    expect(() => assertForwardTransition('shortlisted', 'shortlisted')).toThrow(BadRequestError);
  });
});
