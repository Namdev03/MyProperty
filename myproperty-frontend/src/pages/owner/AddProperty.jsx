import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { createProperty } from "../../redux/slices/propertySlice.js";

const PROPERTY_TYPES = [
  "Apartment", "Hotel", "Villa", "House", "PG", "Office", "Shop", "Land", "Farm House",
];

const IMAGE_FIELDS = [
  { name: "propertyImages", label: "Main Property Images" },
  { name: "roomImages", label: "Room Images" },
  { name: "kitchenImages", label: "Kitchen Images" },
  { name: "bathroomImages", label: "Bathroom Images" },
  { name: "hallImages", label: "Hall Images" },
];

export function AddProperty() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [imageFiles, setImageFiles] = useState({});

  const handleFileChange = (fieldName, files) => {
    setImageFiles((prev) => ({ ...prev, [fieldName]: Array.from(files) }));
  };

  const onSubmit = async (formValues) => {
    if (!imageFiles.propertyImages?.length) {
      toast.error("At least one main property image is required");
      return;
    }

    const formData = new FormData();

    Object.entries(formValues).forEach(([key, value]) => {
      if (key === "amenities") {
        // Split comma-separated amenities into a JSON array the backend expects
        const list = value
          ? value.split(",").map((a) => a.trim()).filter(Boolean)
          : [];
        formData.append("amenities", JSON.stringify(list));
      } else if (["petBike", "petCar"].includes(key)) {
        // handled separately below as `parking`
      } else {
        formData.append(key, value);
      }
    });

    formData.append(
      "parking",
      JSON.stringify({ bike: !!formValues.petBike, car: !!formValues.petCar })
    );
    formData.append(
      "area",
      JSON.stringify({ value: Number(formValues.areaValue), unit: formValues.areaUnit || "sq.ft" })
    );

    IMAGE_FIELDS.forEach(({ name }) => {
      (imageFiles[name] || []).forEach((file) => formData.append(name, file));
    });

    const result = await dispatch(createProperty(formData));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Property added successfully");
      navigate("/owner/properties");
    } else {
      toast.error(result.payload || "Failed to add property");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-[#14213D]">Add New Property</h1>
      <p className="mt-1 mb-8 text-sm text-gray-500">Fill in the details below to list your property</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic details */}
        <Section title="Basic Details">
          <TextField label="Title" error={errors.title} inputProps={register("title", { required: "Title is required" })} />
          <TextArea label="Description" error={errors.description} inputProps={register("description", { required: "Description is required" })} />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Property Type"
              error={errors.propertyType}
              inputProps={register("propertyType", { required: "Required" })}
              options={PROPERTY_TYPES}
            />
            <SelectField
              label="Purpose"
              error={errors.purpose}
              inputProps={register("purpose", { required: "Required" })}
              options={["Rent", "Sale"]}
            />
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Price (₹)" type="number" error={errors.price} inputProps={register("price", { required: "Required" })} />
            <TextField label="Security Deposit (₹)" type="number" inputProps={register("securityDeposit")} />
          </div>
        </Section>

        {/* Specs */}
        <Section title="Specifications">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TextField label="Bedrooms" type="number" inputProps={register("bedrooms")} />
            <TextField label="Bathrooms" type="number" inputProps={register("bathrooms")} />
            <TextField label="Balconies" type="number" inputProps={register("balconies")} />
            <TextField label="Kitchens" type="number" inputProps={register("kitchens")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Area value" type="number" inputProps={register("areaValue", { required: "Required" })} />
            <SelectField label="Area unit" inputProps={register("areaUnit")} options={["sq.ft", "sq.m", "acres"]} />
          </div>
          <SelectField
            label="Furnishing"
            inputProps={register("furnished")}
            options={["Fully Furnished", "Semi Furnished", "Unfurnished"]}
          />
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("petBike")} /> Bike Parking
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("petCar")} /> Car Parking
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("petsAllowed")} /> Pets Allowed
            </label>
          </div>
          <TextField label="Amenities (comma separated)" inputProps={register("amenities")} placeholder="Gym, Pool, Lift" />
        </Section>

        {/* Address */}
        <Section title="Address">
          <TextField label="Address" error={errors.address} inputProps={register("address", { required: "Required" })} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TextField label="City" error={errors.city} inputProps={register("city", { required: "Required" })} />
            <TextField label="State" error={errors.state} inputProps={register("state", { required: "Required" })} />
            <TextField label="Country" error={errors.country} inputProps={register("country", { required: "Required" })} />
            <TextField label="Pincode" inputProps={register("pincode")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Latitude" type="number" inputProps={register("latitude")} />
            <TextField label="Longitude" type="number" inputProps={register("longitude")} />
          </div>
        </Section>

        {/* Images */}
        <Section title="Images">
          {IMAGE_FIELDS.map(({ name, label }) => (
            <div key={name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} {name === "propertyImages" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(name, e.target.files)}
                className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#14213D] file:px-3 file:py-1.5 file:text-xs file:text-white"
              />
              {imageFiles[name]?.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">{imageFiles[name].length} file(s) selected</p>
              )}
            </div>
          ))}
        </Section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#14213D] py-3 text-sm font-semibold text-white transition hover:bg-[#2F6844] disabled:opacity-60"
        >
          {isSubmitting ? "Publishing..." : "Publish Property"}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E7E4DC] p-5">
      <h2 className="mb-4 font-semibold text-[#14213D]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TextField({ label, type = "text", error, inputProps, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        {...inputProps}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

function TextArea({ label, error, inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        rows={4}
        {...inputProps}
        className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844] focus:ring-2 focus:ring-[#2F6844]/15"
      />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

function SelectField({ label, error, inputProps, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        {...inputProps}
        className="w-full rounded-lg border border-[#E7E4DC] px-3 py-2 text-sm outline-none focus:border-[#2F6844]"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
