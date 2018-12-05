import * as d from '../../declarations';
import { MEMBER_TYPE, PROP_TYPE } from '../../util/constants';
import { mockDomApi, mockPlatform } from '../../testing/mocks';
import { proxyComponentInstance } from '../proxy-component-instance';


describe('proxy-component', () => {

  let plt: d.PlatformApi;
  let elm: d.HostElement;
  let instance: d.ComponentInstance;
  let CmpConstructor: d.ComponentConstructor;
  let hostSnapshot: d.HostSnapshot;

  beforeEach(() => {
    plt = mockPlatform();
    plt.isAppLoaded = true;
    elm = plt.domApi.$createElement('ion-cmp') as any;
    CmpConstructor = TwinPines as any;
    instance = new TwinPines();
    plt.instanceMap.set(elm, instance);
    plt.hostElementMap.set(instance, elm);
    hostSnapshot = {};
  });


  describe('watch callbacks', () => {

    it('watch callbacks called', () => {
      instance.chg = 'oldValue';
      spyOn(instance, 'watchCallbackA');
      spyOn(instance, 'watchCallbackB');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.chg = 'newValue';
      expect(instance.watchCallbackA).toBeCalledWith('newValue', 'oldValue', 'chg');
      expect(instance.watchCallbackB).toBeCalledWith('newValue', 'oldValue', 'chg');
    });

    it('multiple watch callbacks called w/ different property names', () => {
      const calls: any[] = [];

      const orgWatchCallbackA = instance.watchCallbackA;
      instance.watchCallbackA = function patchWatchCallbackA(newValue: string, oldValue: string, propName: string) {
        calls.push([newValue, oldValue, propName]);
      };

      instance.chg = 'oldValueChg1';
      instance.chg2 = 'oldValueChg2';
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);

      instance.chg = 'newValueChg1';
      instance.chg2 = 'newValueChg2';

      expect(calls).toHaveLength(2);
      expect(calls[0][0]).toBe('newValueChg1');
      expect(calls[0][1]).toBe('oldValueChg1');
      expect(calls[0][2]).toBe('chg');

      expect(calls[1][0]).toBe('newValueChg2');
      expect(calls[1][1]).toBe('oldValueChg2');
      expect(calls[1][2]).toBe('chg2');
    });

  });

  describe('has changed, if it has rendered once', () => {

    it('instance number changed', () => {
      elm['s-rn'] = true;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.num = 141.622;
      expect(plt.queue.write).toHaveBeenCalled();
    });

    it('instance string changed', () => {
      elm['s-rn'] = true;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.str = 'kph';
      expect(plt.queue.write).toHaveBeenCalled();
    });

    it('instance boolean changed', () => {
      elm['s-rn'] = true;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.bool = false;
      expect(plt.queue.write).toHaveBeenCalled();
    });

  });

  describe('no change, if it has rendered once', () => {

    it('instance number unchanged', () => {
      elm['s-rn'] = true;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.num = 88;
      expect(plt.queue.write).not.toHaveBeenCalled();
    });

    it('instance string unchanged', () => {
      elm['s-rn'] = true;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.str = 'mph';
      expect(plt.queue.write).not.toHaveBeenCalled();
    });

    it('instance boolean unchanged', () => {
      elm['s-rn'] = true;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.bool = true;
      expect(plt.queue.write).not.toHaveBeenCalled();
    });

  });

  describe('does not queue another render if it hasnt rendered yet', () => {

    it('instance number changed', () => {
      elm['s-rn'] = false;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.num = 1234;
      expect(plt.queue.write).not.toHaveBeenCalled();
    });

    it('instance string changed', () => {
      elm['s-rn'] = false;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.str = 'asdfasdf';
      expect(plt.queue.write).not.toHaveBeenCalled();
    });

    it('instance boolean changed', () => {
      elm['s-rn'] = false;
      spyOn(plt.queue, 'write');
      proxyComponentInstance(plt, CmpConstructor, elm, instance, hostSnapshot);
      instance.bool = false;
      expect(plt.queue.write).not.toHaveBeenCalled();
    });

  });


  class TwinPines {
    num = 88;
    str = 'mph';
    bool = true;
    arr = [1, 21];
    obj = { 'flux': 'plutonium' };

    watchCallbackA(newValue: any, oldValue: any) {/**/}
    watchCallbackB(newValue: any, oldValue: any) {/**/}

    static get properties() {
      return {
        'num': {
          mutable: true,
          attr: 'num',
          type: Number
        },
        'str': {
          mutable: true,
          attr: 'str',
          type: String
        },
        'bool': {
          mutable: true,
          attr: 'bool',
          type: Boolean
        },
        'arr': {
          mutable: true,
          attr: 'arr',
          type: 'Any'
        },
        'obj': {
          mutable: true,
          attr: 'obj',
          type: 'Any'
        },
        'chg': {
          mutable: true,
          type: Boolean,
          watchCallbacks: ['watchCallbackA', 'watchCallbackB']
        },
        'chg2': {
          mutable: true,
          type: Boolean,
          watchCallbacks: ['watchCallbackA']
        },
        'rflBool': {
          reflectToAttr: true,
          attr: 'rfl-bool',
          type: Boolean,
        }
      };
    }
  }

});
