export type FieldType = "text" | "textarea" | "number" | "integer" | "boolean" | "select" | "image" | "url"

export type ProductField = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  hint?: string
  /** Only show (and save) this field when another field has one of the given values. */
  showWhen?: { field: string; in: string[] }
  /** Replace the label depending on the value of another field. */
  labelWhen?: { field: string; labels: Record<string, string> }
}

export type ProductTable = {
  table:
    | "motors"
    | "controllers"
    | "hmi_displays"
    | "batteries"
    | "chargers"
    | "charging_ports"
    | "speed_sensors"
    | "cadence_sensors"
    | "torque_sensors"
    | "accessories"
    | "bike_components"
  label: string
  singular: string
  fields: ProductField[]
}

const common: ProductField[] = [
  { name: "image_url", label: "Picture", type: "image" },
  { name: "short_description", label: "Description", type: "textarea" },
  { name: "datasheet_url", label: "Datasheet link", type: "url" },
  { name: "sort_order", label: "Display order", type: "integer", hint: "Lower numbers appear first." },
  { name: "is_active", label: "Visible in configurator", type: "boolean" },
]

const simple: ProductField[] = [
  { name: "image_url", label: "Picture", type: "image" },
  { name: "short_description", label: "Description", type: "textarea" },
  { name: "sort_order", label: "Display order", type: "integer", hint: "Lower numbers appear first." },
  { name: "is_active", label: "Visible in configurator", type: "boolean" },
]

const listing: ProductField[] = [
  { name: "sort_order", label: "Display order", type: "integer", hint: "Lower numbers appear first." },
  { name: "is_active", label: "Visible in configurator", type: "boolean" },
]

/** Label telling the configurator which motor platform a sensor is offered with. */
const motorPlatformField: ProductField = {
  name: "motor_platform",
  label: "Used in",
  type: "select",
  required: true,
  options: [
    { value: "mid_drive", label: "Mid-drive motor system" },
    { value: "hub", label: "Hub motor system" },
    { value: "both", label: "Both mid-drive and hub" },
  ],
}

const waterproofField: ProductField = {
  name: "waterproof",
  label: "Waterproof rating",
  type: "text",
  hint: "For example IP65 or IP67.",
}

export const CHARGER_VOLTAGE_OPTIONS = [
  { value: "36", label: "36V" },
  { value: "48", label: "48V" },
  { value: "36_48", label: "36V & 48V" },
]

/**
 * A value that can differ per voltage platform: one field for 36V (or the only voltage)
 * and a second one, shown only for 36V & 48V products, for 48V.
 */
function dualVoltageFields(primary: string, secondary: string, label: string, unit: string): ProductField[] {
  return [
    {
      name: primary,
      label: `${label} (${unit})`,
      type: "number",
      labelWhen: {
        field: "voltage_option",
        labels: {
          "36": `${label} at 36V (${unit})`,
          "48": `${label} at 48V (${unit})`,
          "36_48": `${label} at 36V (${unit})`,
        },
      },
    },
    {
      name: secondary,
      label: `${label} at 48V (${unit})`,
      type: "number",
      showWhen: { field: "voltage_option", in: ["36_48"] },
    },
  ]
}

export const PRODUCT_TABLES: ProductTable[] = [
  {
    table: "motors",
    label: "Motors",
    singular: "motor",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      {
        name: "motor_type",
        label: "Motor type",
        type: "select",
        required: true,
        options: [
          { value: "mid_drive", label: "Mid drive" },
          { value: "hub", label: "Hub" },
        ],
      },
      { name: "voltage_v", label: "Voltage (V)", type: "integer", required: true },
      { name: "torque_nm", label: "Torque (Nm)", type: "number" },
      { name: "rated_power_w", label: "Rated power (W)", type: "integer" },
      { name: "peak_power_w", label: "Peak power (W)", type: "integer" },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      { name: "size", label: "Size", type: "text" },
      {
        name: "controller_requirement",
        label: "Controller",
        type: "select",
        options: [
          { value: "integrated", label: "Integrated" },
          { value: "external", label: "External" },
        ],
      },
      { name: "pedal_sensing", label: "Pedal sensing", type: "text" },
      { name: "communication_protocol", label: "Communication protocol", type: "text" },
      { name: "rpm", label: "RPM", type: "integer" },
      { name: "waterproof", label: "Waterproof rating", type: "text" },
      { name: "color", label: "Colour", type: "text" },
      { name: "is_recommended", label: "Recommended", type: "boolean" },
      ...common,
    ],
  },
  {
    table: "controllers",
    label: "Controllers",
    singular: "controller",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      {
        name: "compatible_motor_type",
        label: "Compatible motor",
        type: "select",
        required: true,
        options: [
          { value: "mid_drive", label: "Mid drive" },
          { value: "hub", label: "Hub" },
        ],
      },
      { name: "voltage_v", label: "Voltage (V)", type: "integer", required: true },
      { name: "rated_power_w", label: "Rated power (W)", type: "integer" },
      { name: "peak_power_w", label: "Peak power (W)", type: "integer" },
      { name: "rated_current_a", label: "Rated current (A)", type: "number" },
      { name: "peak_current_a", label: "Peak current (A)", type: "number" },
      { name: "communication_protocol", label: "Communication protocol", type: "text" },
      { name: "connection_type", label: "Connection type", type: "text" },
      { name: "size", label: "Size", type: "text" },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      ...common,
    ],
  },
  {
    table: "hmi_displays",
    label: "Displays",
    singular: "display",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      { name: "size", label: "Screen size", type: "text" },
      { name: "display_material", label: "Display material", type: "text" },
      { name: "connection_type", label: "Connection type", type: "text" },
      { name: "voltage_v", label: "Voltage (V)", type: "integer" },
      { name: "communication_protocol", label: "Communication protocol", type: "text" },
      { name: "mounting_position", label: "Mounting position", type: "text" },
      { name: "certifications", label: "Certifications", type: "text" },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      { name: "bluetooth", label: "Bluetooth", type: "boolean" },
      { name: "has_4g", label: "4G", type: "boolean" },
      { name: "has_gps", label: "GPS", type: "boolean" },
      ...common,
    ],
  },
  {
    table: "batteries",
    label: "Batteries",
    singular: "battery",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
  {
  name: "voltage_option",
  label: "Voltage platform",
  type: "select",
  required: true,
  options: CHARGER_VOLTAGE_OPTIONS,
  hint: "Choose 36V & 48V for a battery that supports both platforms.",
  },
      ...dualVoltageFields("capacity_ah", "capacity_ah_secondary", "Rated capacity", "Ah"),
      ...dualVoltageFields("capacity_wh", "capacity_wh_secondary", "Energy capacity", "Wh"),
      ...dualVoltageFields("normal_discharge_current_a", "normal_discharge_current_secondary_a", "Normal discharge current", "A"),
      ...dualVoltageFields("max_continuous_discharge_current_a", "max_continuous_discharge_current_secondary_a", "Max discharge current", "A"),
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      { name: "size", label: "Size", type: "text" },
      { name: "length_mm", label: "Length (mm)", type: "number" },
      { name: "width_mm", label: "Width (mm)", type: "number" },
      { name: "height_mm", label: "Height (mm)", type: "number" },
      { name: "communication_protocol", label: "Communication protocol", type: "text" },
      { name: "safety_certificate", label: "Safety certificate", type: "text" },
      ...common,
    ],
  },
  {
    table: "chargers",
    label: "Chargers",
    singular: "charger",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      {
        name: "voltage_option",
        label: "Battery voltage",
        type: "select",
        required: true,
        options: CHARGER_VOLTAGE_OPTIONS,
        hint: "Choose 36V & 48V for a charger that works with both battery types.",
      },
      {
        name: "current_a",
        label: "Current (A)",
        type: "number",
        required: true,
        labelWhen: {
          field: "voltage_option",
          labels: { "36": "Current at 36V (A)", "48": "Current at 48V (A)", "36_48": "Current at 36V (A)" },
        },
      },
      {
        name: "current_secondary_a",
        label: "Current at 48V (A)",
        type: "number",
        required: true,
        showWhen: { field: "voltage_option", in: ["36_48"] },
      },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      ...simple,
    ],
  },
  {
    table: "charging_ports",
    label: "Charging ports",
    singular: "charging port",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      { name: "connector_type", label: "Connector type", type: "text" },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      ...simple,
    ],
  },
  {
    table: "speed_sensors",
    label: "Speed sensors",
    singular: "speed sensor",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      { name: "name", label: "Display name", type: "text" },
      {
        ...motorPlatformField,
        hint: "Which motor platform this sensor is offered with. Choose Both to show it with mid-drive and hub systems.",
      },
      { name: "mounting_position", label: "Mounting position", type: "text" },
      { name: "cable_length_mm", label: "Cable length (mm)", type: "integer" },
      { name: "connector_type", label: "Connector type", type: "text" },
      waterproofField,
      ...common,
    ],
  },
  {
    table: "cadence_sensors",
    label: "Cadence sensors",
    singular: "cadence sensor",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      { name: "name", label: "Display name", type: "text" },
      {
        ...motorPlatformField,
        hint: "Mid-drive motors have a built-in cadence sensor, so these are only offered in hub-motor systems.",
      },
      { name: "mounting_position", label: "Mounting position", type: "text" },
      { name: "cable_length_mm", label: "Cable length (mm)", type: "integer" },
      { name: "connector_type", label: "Connector type", type: "text" },
      waterproofField,
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      ...common,
    ],
  },
  {
    table: "torque_sensors",
    label: "Torque sensors",
    singular: "torque sensor",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      { name: "name", label: "Display name", type: "text" },
      {
        ...motorPlatformField,
        hint: "Mid-drive motors have a built-in torque sensor, so these are only offered in hub-motor systems.",
      },
      { name: "mounting_position", label: "Mounting position", type: "text" },
      { name: "cable_length_mm", label: "Cable length (mm)", type: "integer" },
      { name: "connector_type", label: "Connector type", type: "text" },
      waterproofField,
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      ...common,
    ],
  },
  {
    table: "accessories",
    label: "Accessories",
    singular: "accessory",
    fields: [
      { name: "model", label: "Name", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "lights", label: "Lights" },
          { value: "throttle", label: "Throttle" },
          { value: "iot", label: "IoT" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      ...simple,
    ],
  },
  {
    table: "bike_components",
    label: "Bike components",
    singular: "bike component",
    fields: [
      { name: "model", label: "Model", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "chainring", label: "Chainring" },
          { value: "crank", label: "Crank" },
          { value: "spider", label: "Spider" },
        ],
      },
      { name: "teeth", label: "Teeth", type: "integer", hint: "Chainrings only." },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      { name: "image_url", label: "Picture", type: "image" },
      { name: "short_description", label: "Description", type: "textarea" },
      ...listing,
    ],
  },
]

export function getProductTable(table: string) {
  return PRODUCT_TABLES.find((t) => t.table === table)
}

export type ProductRecord = Record<string, string | number | boolean | null> & { id: string }
