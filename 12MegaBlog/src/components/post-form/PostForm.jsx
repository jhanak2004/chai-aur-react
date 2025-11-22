import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active"
    }
  });

  const navigate = useNavigate();

  // Get userData from auth state
  const userData = useSelector((state) => state.auth?.userData);

  const submit = async (data) => {
    try {
      if (post) {
        // If image provided, upload it first, otherwise proceed to update
        let file = null;
        if (data?.image && data.image[0]) {
          file = await appwriteService.uploadFile(data.image[0]);
        } else {
          // If no new image provided, keep existing featuredImage
        }

        // If there was a previous featured image and a new file uploaded, delete previous
        if (file && post?.featuredImage) {
          try {
            await appwriteService.deleteFile(post.featuredImage);
          } catch (e) {
            // log but don't block update
            console.warn("Failed to delete old file", e);
          }
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : post.featuredImage
        });

        if (dbPost) navigate(`/posts/${dbPost.$id}`);
      } else {
        // creating a new post — ensure there's an image if required
        let file = null;
        if (data?.image && data.image[0]) {
          file = await appwriteService.uploadFile(data.image[0]);
        }

        // guard: ensure userData exists before using userData.$id
        const userId = userData?.$id;
        if (!userId) {
          // handle unauthenticated user gracefully
          console.error("Cannot create post: user not authenticated");
          return;
        }

        const payload = {
          ...data,
          featuredImage: file ? file.$id : undefined,
          userId
        };

        const dbPost = await appwriteService.createPost(payload);
        if (dbPost) navigate(`/posts/${dbPost.$id}`);
      }
    } catch (err) {
      console.error("PostForm submit error:", err);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        // remove invalid chars (keep letters, digits and spaces), then replace spaces with -
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true
            });
          }}
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && post.featuredImage && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
