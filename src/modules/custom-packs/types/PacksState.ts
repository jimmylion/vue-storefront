export interface PacksState {

  // It is not an array. Just representation in shape custom_pack_id-PackOptions
  // custom_pack_id is category's attribute
  // ...mapGetters('category', ['getCategories']),
  // Then this.getCategories should contain categories with attribute custom_pack_id

  packOptions: {
   [key: number]: any
 },

 // Array of products available on Creator page
 productsAvailable: Array<any> | null

}
