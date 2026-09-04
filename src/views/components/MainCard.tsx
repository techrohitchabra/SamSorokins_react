import React from "react";
import { Card, CardHeader, Divider } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import FormContainer from "./inputs/FormContainer";

type CardProps = {
  title?: any;
  actions?: any;
  content?: any;
  children?: React.ReactNode;
  formContext?: any;
  onSubmit?: any;
  allowFormContainer?: boolean;
  subheader?: any;
};

/**
 *  Custom Card wrapper for the main routes.
 * @hook MainCard
 * @author Sanjay
 *
 */

export default function MainCard({
  title,
  actions,
  content,
  children,
  formContext,
  onSubmit,
  allowFormContainer = false,
  subheader,
}: CardProps) {
  const shouldRenderHeader = title || actions;
  const bodyContent = content ?? children;

  return (
    <>
      {allowFormContainer ? (
        <FormContainer formContext={formContext} onSuccess={onSubmit}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {shouldRenderHeader && (
              <>
                <CardHeader
                  title={title}
                  subheader={subheader}
                  action={actions}
                  sx={{ py: 1.5, px: 2 }}
                />
                <Divider />
              </>
            )}
            <CardContent sx={{ flex: 1, overflow: "auto" }}>
              {bodyContent}
            </CardContent>
          </Card>
        </FormContainer>
      ) : (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            height: "98%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {shouldRenderHeader && (
            <>
              <CardHeader
                title={title}
                action={actions}
                sx={{ py: 1.5, px: 2 }}
              />
              <Divider />
            </>
          )}
          <CardContent
            sx={{
              flex: 1,
              overflow: "auto",
              // Hide scrollbar but keep functionality
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {bodyContent}
          </CardContent>
        </Card>
      )}
    </>
  );
}
