import React from "react";
import InputFields from "~/components/elements/inputField";
import { ErrorData } from "~/types/errorHandling";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import cn from "classnames";
import { useModalStore } from "~/utils/store";
import { CopyToClipboard } from "react-copy-to-clipboard";

// import { useTranslations } from "next-intl";

// type UserGroupWithCount = UserGroup & {
// 	_count: {
// 		users: number;
// 	};
// };

const ApiLables = ({ tokens }) => {
	if (!Array.isArray(tokens) || !tokens) return null;
	// const t = useTranslations("admin");

	const { refetch } = api.admin.getApiToken.useQuery();

	const { callModal } = useModalStore((state) => state);
	const { mutate: deleteToken } = api.admin.deleteApiToken.useMutation({
		onError: (error) => {
			if ((error.data as ErrorData)?.zodError) {
				const fieldErrors = (error.data as ErrorData)?.zodError.fieldErrors;
				for (const field in fieldErrors) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-call
					toast.error(`${fieldErrors[field].join(", ")}`);
				}
			} else if (error.message) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
		},
		onSuccess: () => {
			toast.success("Group deleted successfully");
			refetch();
		},
	});
	return (
		<div className="flex flex-wrap gap-3 text-center">
			{tokens?.map((token) => {
				return (
					<div
						key={token.id}
						className={cn("badge badge-lg rounded-md flex items-center badge-primary")}
					>
						<div
							onClick={() => {
								// open modal
								callModal({
									title: <p>Token Info</p>,
									rootStyle: "text-left",
									showButtons: true,
									closeModalOnSubmit: true,
									content: (
										<div>
											<div className="flex justify-between w-3/6">
												<span className="text-sm text-gray-500">Name:</span>
												<span>{token.name}</span>
											</div>
											<div className="flex justify-between w-3/6">
												<span className="text-sm text-gray-500">Expires At:</span>
												{token.expiresAt
													? new Date(token.expiresAt).toDateString()
													: "Never"}
											</div>
											<div className="flex justify-between w-3/6">
												<span className="text-sm text-gray-500">isActive:</span>
												{token.isActive ? "True" : "False"}
											</div>
										</div>
									),
								});
							}}
							className="cursor-pointer"
						>
							<p>{token.name}</p>
						</div>

						<div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="z-10 ml-4 h-4 w-4 cursor-pointer text-warning"
								onClick={() => {
									callModal({
										title: "Delete Token",
										description: "Are you sure you want to delete this API token?",
										yesAction: () => {
											deleteToken({
												id: token.id,
											});
										},
									});
								}}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
								/>
							</svg>
						</div>
					</div>
				);
			})}
		</div>
	);
};
const ApiToken = () => {
	const callModal = useModalStore((state) => state.callModal);

	// const t = useTranslations("admin");
	const { data: apiTokens, refetch } = api.admin.getApiToken.useQuery();

	const { mutate: addToken } = api.admin.addApiToken.useMutation({
		onError: (error) => {
			if ((error.data as ErrorData)?.zodError) {
				const fieldErrors = (error.data as ErrorData)?.zodError.fieldErrors;
				for (const field in fieldErrors) {
					toast.error(`${fieldErrors[field].join(", ")}`);
				}
			} else if (error.message) {
				toast.error(error.message);
			} else {
				toast.error("An unknown error occurred");
			}
		},
		onSuccess: () => {
			toast.success("API Token created successfully");
			refetch();
		},
	});

	return (
		<div className="space-y-5">
			{/* <div className="">
				<p className="text-sm text-gray-500">TEst</p>
			</div> */}
			<InputFields
				label="Api Token"
				rootFormClassName="flex flex-col space-y-2"
				size="sm"
				placeholder=""
				buttonText="Create Token"
				fields={[
					{
						name: "name",
						type: "text",
						elementType: "input",
						placeholder: "my awesome token",
						description: "Add a meaningful name to your token",
					},
				]}
				submitHandler={(params) =>
					new Promise((resolve) => {
						void addToken(
							{
								...params,
							},
							{
								onSuccess: (response) => {
									callModal({
										// title: "Token Created",
										// description: "This will only be shown once. Please copy it now!",
										content: (
											<CopyToClipboard
												text={response.token}
												onCopy={() => toast.success("successfully copied")}
												title="Copied to clipboard"
											>
												<div className="flex flex-col items-center space-y-2 max-w-3/6">
													<p className="text-sm text-gray-300">
														This token will only be shown once. Please copy it now!
													</p>
													<p className="text-sm text-gray-300">Click the token to Copy</p>
													<p className="text-sm text-gray-500 break-all">
														<span className="text-primary cursor-pointer">
															{response.token}
														</span>
													</p>
												</div>
											</CopyToClipboard>
										),
									});
									resolve(true);
								},
							},
						);
					})
				}
			/>
			<ApiLables tokens={apiTokens} />
		</div>
	);
};

export default ApiToken;
