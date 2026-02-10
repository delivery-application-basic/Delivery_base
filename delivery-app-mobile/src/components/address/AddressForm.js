/**
 * AddressForm - Form fields for add/edit address
 */

import React from 'react';
import { View } from 'react-native';
import { Input } from '../common/Input';

export const AddressForm = ({ value, onChange, errors }) => (
  <View>
    <Input label="Label" value={value?.address_label} onChangeText={(v) => onChange?.({ ...value, address_label: v })} error={errors?.address_label} placeholder="Home / Work" />
    <Input label="Street" value={value?.street_address} onChangeText={(v) => onChange?.({ ...value, street_address: v })} error={errors?.street_address} />
    <Input label="Sub-city" value={value?.sub_city} onChangeText={(v) => onChange?.({ ...value, sub_city: v })} error={errors?.sub_city} />
    <Input label="City" value={value?.city} onChangeText={(v) => onChange?.({ ...value, city: v })} error={errors?.city} />
    <Input label="Landmark" value={value?.landmark} onChangeText={(v) => onChange?.({ ...value, landmark: v })} error={errors?.landmark} placeholder="Optional" />
  </View>
);

export default AddressForm;
