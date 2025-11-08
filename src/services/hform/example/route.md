```tsx
const fileUploadForm = HForm(fileUploadFormDefinition, fileUploadFormOptions);

app.get("/file-upload", (c) => {
  const initialFormHtml = fileUploadForm.render();

  return c.html(
    renderPage(initialFormHtml, "File Upload", "file-upload-form-container"),
  );
});

app.post("/file-upload-submit", async (c) => {
  const body = await c.req.parseBody();

  const parseResult = fileUploadFormSchema.safeParse(body);

  if (parseResult.success === false) {
    const errors = fileUploadForm.handleValidation(parseResult);
    const html = fileUploadForm.render(body as FileUploadFormValues, errors);
    return c.html(html);
  }

  const values: FileUploadFormValues = parseResult.data;
  console.log("File Upload Success! Data:", values);

  return c.html(html`
    <div class="success-message" id="${fileUploadFormOptions.id}-success">
      <h2>File Uploaded!</h2>
      <p>File: ${values.myimage.name} (${values.myimage.size} bytes)</p>
      <p>Type: ${values.myimage.type}</p>
      <p style="margin-top:15px;">
        <a href="/file-upload" hx-boost="true">Upload Another File</a>
      </p>
    </div>
  `);
});
```
