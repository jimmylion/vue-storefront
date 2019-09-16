export interface PacksState {

  // It is not an array. Just representation in shape custom_pack_id-PackOptions
  // custom_pack_id is category's attribute
  // ...mapGetters('category', ['getCategories']),
  // Then this.getCategories should contain categories with attribute custom_pack_id

  packOptions: {
   [key: number]: any
  },

  // User's current packs
  // Example key: 4-pack-knee-high
  // So it is [pack-size]-[pack-type]
  packs: {},

  addingToCartNow: boolean

}
