"use server";

import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/db";
import { authSchema, petFormSchema, petIdShcema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { checkAuth, getPetById } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
// --- user actions ---

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function logIn(prevState: unknown, formData: unknown) {
  // check if formdata is a FormData type
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data.",
    };
  }

  //convert FormData to a plain object
  const formDataEntries = Object.fromEntries(formData.entries());

  try {
    await signIn("credentials", formDataEntries);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid credential",
          };
        default:
          return {
            message: "Could not sign in",
          };
      }
    } else {
      throw error; //nextjs redircts throws error,so we need to re-throw it again
    }
  }
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

export async function signUp(prevState: unknown, formData: unknown) {
  // check if formdata is a FormData type
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data.",
    };
  }

  //convert FormData to a plain object
  const formDataEntries = Object.fromEntries(formData.entries());

  //validation with zod
  const validatedFormDataObject = authSchema.safeParse(formDataEntries);
  if (!validatedFormDataObject.success) {
    return {
      message: "Invalid form data",
    };
  }

  const { email, password } = validatedFormDataObject.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Email already exists.",
        };
      }
    }

    return {
      message: "Could not sign up",
    };
  }

  try {
    await signIn("credentials", validatedFormDataObject.data);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid credential",
          };
        default:
          return {
            message: "AuthError.Could not sign in",
          };
      }
    } else {
      throw error; //nextjs redircts throws error,so we need to re-throw it again
    }
  }
}

// --- pet actions ---
export async function addPet(pet: unknown) {
  try {
    const session = await checkAuth();

    const validatePet = petFormSchema.safeParse(pet);

    if (!validatePet.success) {
      return {
        message: "Invalid pet data",
      };
    }

    await prisma.pet.create({
      data: {
        ...validatePet.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    revalidatePath("/app", "layout");
  } catch (e) {
    return {
      message: "Could not add pet",
    };
  }
}

export async function editPet(petId: unknown, newPetData: unknown) {
  // authentication check
  const session = await checkAuth();

  const validatePetId = petIdShcema.safeParse(petId);
  const validatePet = petFormSchema.safeParse(newPetData);

  if (!validatePet.success || !validatePetId.success) {
    return {
      message: "Invalid pet data",
    };
  }

  // authorization check
  const pet = await getPetById(validatePetId.data);
  if (!pet) {
    return {
      message: "Pet not found",
    };
  }

  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized",
    };
  }

  try {
    await prisma.pet.update({
      where: {
        id: validatePetId.data,
      },
      data: validatePet.data,
    });

    revalidatePath("/app", "layout");
  } catch (e) {
    return {
      message: "Could not edit pet",
    };
  }
}

export async function deletePet(petId: unknown) {
  try {
    const session = await checkAuth();

    const validatePetId = petIdShcema.safeParse(petId);
    if (!validatePetId.success) {
      return {
        message: "Invalid pet data",
      };
    }

    // authorization check
    const pet = await getPetById(validatePetId.data);

    if (!pet) {
      return {
        message: "Pet not found",
      };
    }

    if (pet.userId !== session.user.id) {
      return {
        message: "Not authorized",
      };
    }

    await prisma.pet.delete({
      where: {
        id: validatePetId.data,
      },
    });

    revalidatePath("/app", "layout");
  } catch (error) {
    return {
      message: "Could not delete pet",
    };
  }
}

export async function createCheckoutSession() {
  const session = await checkAuth();

  console.log("createCheckoutSession", session);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: "price_1QCbZOCpIaOq6zBu8IpHdbX6",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?cancelled=true`,
  });

  redirect(checkoutSession.url);
}
