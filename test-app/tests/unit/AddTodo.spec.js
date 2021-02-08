import Vuex from 'vuex';

import { shallowMount, createLocalVue } from '@vue/test-utils'
import AddTodo from '@/components/AddTodo.vue'

const localVue = createLocalVue()

localVue.use(Vuex)


describe('AddTodo.vue', () => {
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      addTodo: jest.fn()
    };

    store = new Vuex.Store({
      modules: {
        todos: {
          state: {},
          actions: actions,
          getters: {},
          mutations: {}
        }
      }
    });
  })

  it('renders h3 when passed', () => {
    const h3 = 'Add Todo'
    const wrapper = shallowMount(AddTodo, { store, localVue })
    expect(wrapper.text()).toMatch(h3)
  })
})
