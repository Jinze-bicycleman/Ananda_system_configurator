export type FieldType = "text" | "textarea" | "number" | "integer" | "boolean" | "select" | "image" | "url"

export type ProductField = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  hint?: string
}

export type ProductTable = {
  table: "motors" | "controllers" | "hmi_displays" | "batteries"
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
      { name: "voltage_v", label: "Voltage (V)", type: "integer", required: true },
      { name: "capacity_ah", label: "Capacity (Ah)", type: "number" },
      { name: "capacity_wh", label: "Energy (Wh)", type: "number" },
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
]

export function getProductTable(table: string) {
  return PRODUCT_TABLES.find((t) => t.table === table)
}

export type ProductRecord = Record<string, string | number | boolean | null> & { id: string }
